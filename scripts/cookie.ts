import {DuploConfig, DuploInstance, zod} from "@duplojs/duplojs";
import cookie from "cookie";
import packageJson from "../package.json";

declare module "@duplojs/duplojs" {
	interface Plugins {
		"@duplojs/cookie": {
			version: string,
			global?: true,
			local?: true,
		},
	}

	interface Request{
		cookies: Record<string, string>;
	}

	interface Response{
		cookies: Record<
			string, 
			{
				value: string,
				params?: cookie.CookieSerializeOptions 
			}
		>;
		setCookie(name: string, value: string, params?: cookie.CookieSerializeOptions): this;
		deleteCookie(name: string, params?: cookie.CookieSerializeOptions): this;
	}

	interface ExtractObject{
		cookies?: Record<string, zod.ZodType>;
	}
}

function duploCookie(instance: DuploInstance<DuploConfig>){
	if(!instance.plugins["@duplojs/cookie"]) instance.plugins["@duplojs/cookie"] = {version: packageJson.version};
	instance.plugins["@duplojs/cookie"].global = true;

	//add function to request & response prototype
	instance.class.Request.prototype.cookies = {};
	
	instance.class.Response.prototype.setCookie = function(name, value, params){
		this.cookies[name] = {value, params};
		return this;
	};
	instance.class.Response.prototype.deleteCookie = function(name, params){
		this.cookies[name] = {
			value: "",
			params: {
				expires: new Date(1),
				maxAge: undefined,
				path: "/",
				...(params ? params : {})
			}
		};
		return this;
	};
	instance.class.Response.prototype.cookies = {};

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
				response.rawResponse.setHeader(
					"set-cookie", 
					Object.entries(response.cookies).map(
						([index, obj]) => cookie.serialize(index, obj.value, obj.params)
					)
				);
			}
		}
	);
}

export default duploCookie;
