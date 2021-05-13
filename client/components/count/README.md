# Count

Count is a React component that shows positive and negative integer numbers, by default with rounded corners. The component internationalizes the passed number. For example, it's used to show post and draft counts as well as the number of people on a team.

![Example](https://cldup.com/KdVOxsaKhS-3000x3000.png)

## Usage

If you want to display a count of some sort -- number of posts, drafts, team members, etc. -- use this component to keep the style consistent across components and to not worry about i18n.

```jsx
function render() {
	return (
		<p>
			<Count count={ this.props.postCount } /> Posts
		</p>
	);
}
```

## Props

### `count`

The number to be displayed. Make sure it's a number, not a string containing a number.

### `primary`

Boolean. Applies `is-primary` class and related styles.

### `compact`

Boolean. Displays counts with a localized compact variant. For example instead of 1234, we see 1.2K for `en` or 1.2 mil for `es`

## Custom Styling

In some cases, it may be necessary to increase the font size or remove the border. In your component's style file, specify rules for the `.count` within your component's selector. For an example, see the `select-dropdown` component's style file.
