import {defineConfig} from "rollup";
import esbuild from "rollup-plugin-esbuild";

export default defineConfig([
	{
		input: "scripts/cookie.ts",
		output: [
			{
				file: "dist/cookie.mjs",
				format: "esm"
			},
			{
				file: "dist/cookie.cjs",
				format: "cjs",
			}
		],
		plugins: [
			esbuild({
				include: /\.[jt]sx?$/,
				exclude: /node_modules/,
				tsconfig: "tsconfig.json",
			})
		]
	},
	{
		input: "scripts/cookieAbstract.ts",
		output: [
			{
				file: "dist/cookieAbstract.mjs",
				format: "esm"
			},
			{
				file: "dist/cookieAbstract.cjs",
				format: "cjs",
			}
		],
		plugins: [
			esbuild({
				include: /\.[jt]sx?$/,
				exclude: /node_modules/,
				tsconfig: "tsconfig.json",
			})
		]
	},
]);
