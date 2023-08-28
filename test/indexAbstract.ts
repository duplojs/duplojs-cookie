import Duplo, {zod} from "@duplojs/duplojs";
import duploCookie from "../scripts/indexAbstract";

const duplo = Duplo({port: 1506, host: "0.0.0.0"});
const abstractCookie = duplo.use(duploCookie);

abstractCookie.declareRoute("GET", "/")
.extract({
	cookies: {
		my_super_cookie: zod.string().optional()
	}
})
.cut((floor, response) => {
	if(floor.pickup("my_super_cookie"))response.code(403).deleteCookie("my_super_cookie").info("already has my super cookie").send();
})
.handler((floor, response) => {
	response.code(200).info("take my super cookie").setCookie("my_super_cookie", "a nice cookie").send();
});

duplo.launch();
