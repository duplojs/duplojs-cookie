import {workersTesting} from "@duplojs/worker-testing";

workersTesting(
	(path) => import(path),
	__dirname + "/global",
	__dirname + "/local",
	__dirname + "/mergeAbstractRoute",
);
