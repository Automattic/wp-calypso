# @automattic/calypso-storybook

Default config for Storybook

## Usage

Create a file `./.storybook/main.js` in your package with this content:

```js
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );
module.exports = { ...storybookDefaultConfig() };
```

Note that the default export must be statically analyzable as an object expression, in order to avoid a [CSF parsing error](https://github.com/storybookjs/storybook/issues/26778) from Storybook.

```js
// ❌ This will cause a CSF parsing error
module.exports = storybookDefaultConfig();
```
