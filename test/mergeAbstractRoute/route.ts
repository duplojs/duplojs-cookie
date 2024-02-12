import Duplo, {zod} from "@duplojs/duplojs";
import duploCookieAbstract from "../../scripts/cookieAbstract";
import {parentPort} from "worker_threads";
import {MergeAbstractRoute1} from "./mergeAbstractRoute";

const duplo = Duplo({port: 1506, host: "0.0.0.0", environment: "DEV"});
const abstractCookie = duplo.use(duploCookieAbstract);

const mergeAbstractRoute1 = MergeAbstractRoute1(duplo, abstractCookie);

mergeAbstractRoute1.declareRoute("GET", "/merge/cookie/test/1")
.extract({
	cookies: {
		token: zod.string().optional()
	},
	url: zod.string(),
})
.cut(({pickup}) => parentPort?.postMessage("merge test " + pickup("test")))
.cut(({pickup}) => parentPort?.postMessage("merge url " + pickup("url")))
.cut(
	({pickup}, response) => {
		const token = pickup("token");
		if(!token)response.code(403).info("e").test().setCookie("token", "123456789", {domain: "localhost"}).send();
		else return {
			token 
		};
	}, 
	["token"]
)
.handler(({pickup}, response) => {
	response.code(200).info("s").send(pickup("token"));
});

duplo.launch(() => parentPort?.postMessage("ready"));
