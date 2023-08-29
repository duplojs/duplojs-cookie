import {DuploInputFunction} from "@duplojs/duplojs";
import cookie from "cookie";
import {ZodType} from "zod";

declare module "@duplojs/duplojs" {
	interface Request{
		cookies: Record<string, string>;
		getCookie(name: string): string;
		getCookies(): Request["cookies"];
	}

	interface Response{
		cookies: Record<
			string, 
			{
				value: string,
				params?: cookie.CookieSerializeOptions 
			}
		>;
		setCookie(name: string, value: string, params?: cookie.CookieSerializeOptions): Response;
		setCookies(cookies: Response["cookies"]): Response;
		deleteCookie(name: string): Response;
	}

	interface RouteExtractObj{
		cookies?: Record<string, ZodType>;
	}

	interface ProcessExtractObj{
		cookies?: Record<string, ZodType>;
	}
}

const duploCookie: DuploInputFunction = (instance, config, options) => {
	//add function to request & response prototype
	instance.Request.prototype.getCookie = function(name){
		return this.cookies[name];
	};
	instance.Request.prototype.getCookies = function(){
		return this.cookies;
	};
	instance.Request.prototype.cookies = {};
	
	instance.Response.prototype.setCookie = function(name, value, params){
		this.cookies[name] = {value, params};
		return this;
	};
	instance.Response.prototype.setCookies = function(cookies){
		this.cookies = {...this.cookies, ...cookies};
		return this;
	};
	instance.Response.prototype.deleteCookie = function(name){
		this.cookies[name] = {
			value: "",
			params: {
				expires: new Date(1),
				maxAge: undefined
			}
		};
		return this;
	};
	instance.Response.prototype.cookies = {};

	//hook cookies
	instance.addHook(
		"onConstructRequest",
		(request) => {
			if(request.rawRequest.headers?.cookie) request.cookies = cookie.parse(request.rawRequest.headers.cookie);
			else request.cookies = {};
		}	
	);
	instance.addHook(
		"beforeSend",
		(request, response) => {
			if(Object.keys(response.cookies).length !== 0){
				const setCookies: string[] = [];
				Object.entries(response.cookies).forEach(([index, obj]) => setCookies.push(cookie.serialize(index, obj.value, obj.params)));
				response.rawResponse.setHeader("set-cookie", setCookies.join(", "));
			}
		}
	);
};

export default duploCookie;
