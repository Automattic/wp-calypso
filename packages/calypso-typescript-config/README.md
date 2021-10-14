# @automattic/calypso-typescript-config

This package contains common configuration files used by several TypeScript packages in Calypso.

Three files are provided:

- `js-package.json`
- `ts-package.json`
- `mixed-package.json`

To use them, create a `tsconfig.json` in your project and extend them: extend `ts-package.json` if your package is written in TypeScript, extend `js-package.json` if it is written in JavaScript and extend `mixed-package.json` if it is written in both. You can add further customization as needed. It is recommended to at least specify `outDir` and `rootDir`.

Example:

```
{
	"extends": "@automattic/calypso-typescript-config/ts-package.json",
	"compilerOptions": {
		"declarationDir": "dist/types",
		"outDir": "dist/esm",
		"rootDir": "src",
		"types": [ "node" ]
	},
	"include": [ "src" ]
}
```
