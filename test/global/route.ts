import Duplo, {zod} from "@duplojs/duplojs";
import duploCookie from "../../scripts/cookie";
import {parentPort} from "worker_threads";

const duplo = Duplo({port: 1506, host: "0.0.0.0"});
duplo.use(duploCookie);

duplo.declareRoute("GET", "/cookie/test/1")
.handler(({}, res) => {
	res.setCookie("token", "123456789", {domain: "localhost"});
	res.code(200).info("s").send();
});

duplo.declareRoute("GET", "/cookie/test/2")
.extract({
	cookies: {
		token: zod.string().optional()
	}
})
.cut(({pickup}, response) => {
	if(!pickup("token"))response.code(403).info("e").send();
})
.handler(({pickup}, response) => {
	response.code(200).info("s").send(pickup("token"));
});

duplo.declareRoute("GET", "/cookie/test/3")
.handler(({}, response) => {
	response.code(200).info("s").deleteCookie("token", {domain: "localhost"}).deleteCookie("token2").send();
});

duplo.launch(() => parentPort?.postMessage("ready"));
