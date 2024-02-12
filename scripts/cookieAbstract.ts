import {Request, Response, DuploInstance, DuploConfig, zod, ExtractObject} from "@duplojs/duplojs";
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
}

export interface RequestCookie extends Request{
	cookies: Record<string, string>;
}

export interface ResponseCookie extends Response{
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

export interface RouteExtractObjCookie extends ExtractObject{
	cookies?: Record<string, zod.ZodType>;
}

function duploCookieAbstract(instance: DuploInstance<DuploConfig>){
	if(!instance.plugins["@duplojs/cookie"]) instance.plugins["@duplojs/cookie"] = {version: packageJson.version};
	instance.plugins["@duplojs/cookie"].local = true;

	return instance
	.declareAbstractRoute<
		RequestCookie, 
		ResponseCookie, 
		RouteExtractObjCookie
	>("DuploCookie")
	.hook("onConstructResponse", response => {
		response.cookies = {};
		response.setCookie = (name, value, params) => {
			response.cookies[name] = {value, params};
			return response;
		};
		response.deleteCookie = (name, params) => {
			response.cookies[name] = {
				value: "",
				params: {
					expires: new Date(1),
					maxAge: undefined,
					path: "/",
					...(params ? params : {})
				}
			};
			return response;
		};
	})
	.hook("onConstructRequest", (request) => {
		if(request.rawRequest.headers?.cookie) request.cookies = cookie.parse(request.rawRequest.headers.cookie);
		else request.cookies = {};
	})
	.hook("beforeSend", (request, response) => {
		if(Object.keys(response.cookies).length !== 0){
			const setCookies: string[] = [];
			Object.entries(response.cookies).forEach(([index, obj]) => setCookies.push(cookie.serialize(index, obj.value, obj.params)));
			response.rawResponse.setHeader("set-cookie", setCookies);
		}
	})
	.build()();
}

export default duploCookieAbstract;
