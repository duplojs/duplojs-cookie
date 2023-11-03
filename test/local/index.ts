import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "set cookie",
			url: "http://localhost:1506/cookie/test/1",
			method: "GET",
			response: {
				code: 200,
				info: "s",
				headers: {
					"set-cookie": "token=123456789; Domain=localhost"
				},
			}
		},
		{
			title: "extract cookie and verif",
			url: "http://localhost:1506/cookie/test/2",
			method: "GET",
			response: {
				code: 403,
				info: "e",
			}
		},
		{
			title: "extract cookie return value",
			url: "http://localhost:1506/cookie/test/2",
			method: "GET",
			headers: {
				cookie: "token=123456789",
			},
			response: {
				code: 200,
				info: "s",
				body: zod.literal("123456789"),
			}
		},
		{
			title: "delete cookie",
			url: "http://localhost:1506/cookie/test/3",
			method: "GET",
			response: {
				code: 200,
				info: "s",
				headers: {
					"set-cookie": "token=; Domain=localhost; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT, token2=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
				},
			}
		},
	]
);
