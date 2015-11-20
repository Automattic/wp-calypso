Main (jsx)
==========

Component used to declare the main area of any given section — it's the main wrapper that gets render first inside `#primary`.

#### How to use:

```js
var Main = require( 'components/main' );

render: function() {
	return (
		<Main (optional) className="your-component">
			Your section content...
		</Main>
	);
}
```

#### Props

* `className`: Add your own class to the wrapper.
