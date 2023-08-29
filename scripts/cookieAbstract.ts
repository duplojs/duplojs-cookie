import {DuploInputFunction, UseAbstractRoute, Request, Response, RouteExtractObj} from "@duplojs/duplojs";
import cookie from "cookie";
import {ZodType} from "zod";

export interface RequestCookie extends Request{
	cookies: Record<string, string>;
	getCookie(name: string): string;
	getCookies(): RequestCookie["cookies"];
}

export interface ResponseCookie extends Response{
	cookies: Record<
		string, 
		{
			value: string,
			params?: cookie.CookieSerializeOptions 
		}
	>;
	setCookie(name: string, value: string, params?: cookie.CookieSerializeOptions): Response;
	setCookies(cookies: ResponseCookie["cookies"]): Response;
	deleteCookie(name: string): Response;
}

export interface RouteExtractObjCookie extends RouteExtractObj{
	cookies?: Record<string, ZodType>;
}

const duploCookieAbstract: DuploInputFunction<any, ReturnType<UseAbstractRoute<any, any, RequestCookie, ResponseCookie, RouteExtractObjCookie>>> = (instance, config, options) => {
	const abstractCookie = instance.declareAbstractRoute<RequestCookie, ResponseCookie, RouteExtractObjCookie>("DuploCookie")
	.hook("onConstructRequest", request => {
		request.cookies = {};
		request.getCookie = (name) => request.cookies[name];
		request.getCookies = () => request.cookies;
	})
	.hook("onConstructResponse", response => {
		response.cookies = {};
		response.setCookie = (name, value, params) => {
			response.cookies[name] = {value, params};
			return response;
		};
		response.setCookies = (cookies) => {
			response.cookies = {...response.cookies, ...cookies};
			return response;
		};
		response.deleteCookie = (name) => {
			response.cookies[name] = {
				value: "",
				params: {
					expires: new Date(1),
					maxAge: undefined
				}
			};
			return response;
		};
	})
	.hook("onConstructRequest", request => {
		if(request.rawRequest.headers?.cookie) request.cookies = cookie.parse(request.rawRequest.headers.cookie);
		else request.cookies = {};
	})
	.hook("beforeSend", (request, response) => {
		if(Object.keys(response.cookies).length !== 0){
			const setCookies: string[] = [];
			Object.entries(response.cookies).forEach(([index, obj]) => setCookies.push(cookie.serialize(index, obj.value, obj.params)));
			response.rawResponse.setHeader("set-cookie", setCookies.join(", "));
		}
	})
	.build()();

	return abstractCookie;
};

export default duploCookieAbstract;
