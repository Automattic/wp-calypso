Head
====

A generic component for layouts and Calypso sections, `Head` has
isomorphism in mind. It allows a parent component to define the document
title, as well as other data important for SEO — namely, a page's
description and its canonical URL. It is, essentially, a wrapper for
[`react-helmet`][helmet].

It should work out of the box on both client- and server-side code,
allowing e.g. a Calypso section to just declare its SEO-oriented meta.
If SEO is not a concern for you, `Head` still has the benefit of
providing a React-minded interface for setting document title.

# Usage

```js
// In `my-sites/foo/controller.js`:
<Head
		title="Foo — WordPress.com"
		description="Awesome foos for your WordPressen!"
		canonicalUrl="https://wordpress.com/foo">
	<FooMain />
</Head>
```

# Next

- This is a newborn component whose status is still uncertain. There
  have been discussions about extending `Main` from `components/main` to
  take the props shown in the example above, rendering `Head` obsolete.

- Whether we keep `Head` or iterate on `Main`, if these components
  prove themselves fit for `/design`'s isomorphic concerns, we could
  start to phase out `lib/screen-title`'s `TitleStore` and actions in
  favor of a Helmet-based approach.

[helmet]: https://github.com/nfl/react-helmet
