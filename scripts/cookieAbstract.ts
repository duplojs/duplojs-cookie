import {UseAbstractRoute, Request, Response, RouteExtractObj, DuploInstance, DuploConfig} from "@duplojs/duplojs";
import cookie from "cookie";
import {ZodType} from "zod";

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
	setCookie(name: string, value: string, params?: cookie.CookieSerializeOptions): Response;
	deleteCookie(name: string): Response;
}

export interface RouteExtractObjCookie extends RouteExtractObj{
	cookies?: Record<string, ZodType>;
}

function duploCookieAbstract(instance: DuploInstance<DuploConfig>){
	const abstractCookie = instance.declareAbstractRoute<RequestCookie, ResponseCookie, RouteExtractObjCookie>("DuploCookie")
	.hook("onConstructRequest", request => {
		request.cookies = {};
	})
	.hook("onConstructResponse", response => {
		response.cookies = {};
		response.setCookie = (name, value, params) => {
			response.cookies[name] = {value, params};
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
}

export default duploCookieAbstract;
