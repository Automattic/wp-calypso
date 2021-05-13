# HTML/JSX Code Guidelines

## Craftsmanship

Writing great HTML is a craft.

- Another developer should be able to read the html and have a clear picture of what everything is and their relationship, without scratching their head.
- Another developer should be able to learn how a section works, and not have to relearn everything when they go to a different one. Consistency.
- Another developer should be able to read a given class on an element and tell where in the structure it falls (sensible prefixes) and whether it's content represents a single entity or a list of entities.
- The markup should not have style preferences, for the most part, so that changing how the CSS renders doesn't leave things with weird meanings (references to position or visuals, left, right, dark, blue).

When writing a section of html make sure you can take a single element in isolation and be able to tell what its content will be. Always represent the nature of the content in the most clear, direct way possible.

Bad:

```html
<a class="page-edit-link">Page Title</a>
```

The example above provides a meaning with the class that is not matched with the text content. Also `link` is redundant on an anchor.

Better:

```html
<h1 class="page-title"><a class="page-edit">Page Title</a></h1>
```

Reflects the proper nature of the title with both a heading element and a clear class, then provides the action semantics to the anchor element.

## Follow Patterns

Follow your own patterns. If you are structuring a `<div class="site">` element and for site title child you use `<h1 class="site-title">` then don't change it to `<div class="footer-site">` for another child, keep the `site-` prefix. This provides a rhythm and anticipation to the reader.

## Indentation

As with JavaScript, HTML indentation should always reflect logical structure. Use tabs and not spaces.

When mixing JavaScript and HTML (via JSX) together, indent JavaScript blocks to match the surrounding HTML code.

Correct:

```js
class Post extends React.Component {
	render() {
		const post = this.props.post;

		return (
			<div id={ 'post-' + post.ID } className="post">
				<h1 class="post-title">{ post.title }</h1>
				<div class="post-content">{ post.content }</div>
			</div>
		);
	}
}
```

Incorrect:

```js
class Post extends React.Component {
	render() {
		const post = this.props.post;

		return (
			<div id={ 'post-' + post.ID } className="post">
				<h1 class="post-title">{ post.title }</h1>
				<div class="post-content">{ post.content }</div>
			</div>
		);
	}
}
```
