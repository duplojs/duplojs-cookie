import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "extract cookie and verif",
			url: "http://localhost:1506/merge/cookie/test/1",
			method: "GET",
			output: [
				"merge test 25", 
				"merge url /merge/cookie/test/1"
			],
			response: {
				code: 403,
				info: "e",
				headers: {
					"set-cookie": "token=123456789; Domain=localhost"
				}
			}
		},
		{
			title: "extract cookie return value",
			url: "http://localhost:1506/merge/cookie/test/1",
			method: "GET",
			headers: {
				cookie: "token=123456789",
			},
			output: [
				"merge test 25", 
				"merge url /merge/cookie/test/1"
			],
			response: {
				code: 200,
				info: "s",
				body: zod.literal("123456789"),
			}
		},
	]
);
