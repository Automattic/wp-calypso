
<!-- eslint-disable wp-no-unsafe-features -->
# wp-no-unsafe-features

## Rule details

Prevent usage of unstable and experimental features provided by `@wordpress/*` packages.
These features are _dangerous_ to use in application code, as the [docs state](https://github.com/WordPress/gutenberg/blob/2d529f5ebfaade01b040c198312807603ac81e4a/docs/contributors/coding-guidelines.md#experimental-and-unstable-apis).

> **There is no support commitment for experimental and unstable APIs.** They can and will be removed or changed without advance warning, including as part of a minor or patch release. As an external consumer, you should avoid these APIs.
> …
>
> - An **experimental API** is one which is planned for eventual public availability, but is subject to further experimentation, testing, and discussion.
> - An **unstable API** is one which serves as a means to an end. It is not desired to ever be converted into a public API.

Based on these guidelines, unstable features are prohibited. Experimental features are prohibited, but can be configured to be allowed project-wide.

### Configuration

The rule can be configured via `allowedImports`.
This should be an object where the keys are import package names and the values are arrays of allowed experimental imports.

#### Example configuration

```json
{
	"wpcalypso/wp-no-unsafe-features": [
		"error",
		{ "allowedImports": { "@wordpress/block-editor": [ "__experimentalBlock" ] } }
	]
}
```

### Forbidden

```js
import { __unstableFeature, __experimentalFeature } from '@wordpress/package';
```

### Allowed

```js
const getFavoriteSites = ( state ) =>
	state.favoriteSiteIds.map( ( siteId ) => getSite( state, siteId ) );
```

```js
class MyComponent extends Component {
	setFoo( foo ) {
		this.setState( { foo }, ( state ) => {
			this.markDone( state.bar );
		} );
	}
}
```

```js
export default connect( partialRight( mapState, 'foo' ) )( MyComponent );
```
