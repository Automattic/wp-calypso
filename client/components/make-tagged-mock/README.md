makeTaggedMock
==============

`makeTaggedMock` is a function that returns a Component. This component will only produce output in
a testing environment, i.e. `process.env.NODE_ENV === 'test'`.
The Component returned by `makeTaggedMock` will render a `<div data-mock="…" />` where `data-mock`
is an attribute containing the string originally passed to `makeTaggedMock`.

This is useful for providing some context in snapshots which rely on mocked components.

Notice the extra snapshot information when using `makeTaggedMock` over `EmptyComponent`:

```diff
   Object {
-    "attribs": Object {},
+    "attribs": Object {
+      "data-mock": "my-sites/plan-features",
+    },
     "children": Array [],
     "name": "div",
     "next": null,
     "parent": null,
     "prev": null,
     "root": [Circular],
     "type": "tag",
   },
```

#### How to use:

```jsx
jest.mock( 'blocks/my-component-to-mock', () =>
	require( 'components/make-tagged-mock' )( 'blocks/my-component-to-mock' )
);

describe( 'My tests', () => {
	test( 'should render a component which depends on my-component-to-mock', () => {
		const wrapper = render( <SomeComponent /> );

		expect( wrapper ).toMatchSnapshot();
	} );
} );
```
