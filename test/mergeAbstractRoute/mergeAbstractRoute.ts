import {DuploInstance, DuploConfig, Response, Request, zod, RouteExtractObj} from "@duplojs/duplojs";
import duploCookieAbstract from "../../scripts/cookieAbstract";

interface RequestTest extends Request{
	test(): this;
}

interface ResponseTest extends Response{
	test(): this;
}

interface extractTest extends RouteExtractObj{
	url?: zod.ZodType
}

const Abstract1 = (duplo: DuploInstance<DuploConfig>) => duplo
.declareAbstractRoute<
	RequestTest,
	ResponseTest,
	extractTest
>("abstract1")
.hook("onConstructRequest", req => {req.test = () => req;})
.hook("onConstructResponse", res => {res.test = () => res;})
.cut(() => ({test: 25}), ["test"])
.build(["test"]);

export const MergeAbstractRoute1 = (duplo: DuploInstance<DuploConfig>, dca: ReturnType<typeof duploCookieAbstract>) => {
	const abstract1 = Abstract1(duplo);

	return duplo.mergeAbstractRoute([
		dca, 
		abstract1({pickup: ["test"]})
	]);
};
