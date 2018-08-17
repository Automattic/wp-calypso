# Mocks stylesheet imports in JS

Jest would fail when trying to import css/scss/sass files that it cannot parse,
i.e. they're not plain JavaScript:

```js
import './style.scss'
```

This helper can be used to transform all those imports to an empty module:

```json
{
	"moduleNameMapper":{
		"\\.(sc|sa|c)ss$": "<rootDir>/test/test/helpers/styles/index.js"
	}
}
```
