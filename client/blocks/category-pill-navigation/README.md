# Category Pill Navigation

This navigation component, designed for consistent design integration, is primarily used on the `/patterns/:category`, `/themes`, and `/blog` pages. It offers a uniform design aesthetic across various sections of the website.

## How to use

```js
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import ImgStar from 'calypso/my-sites/patterns/pages/category/images/star.svg';

function render() {
	return (
		<CategoryPillNavigation
			list={ Array.from( { length: 15 }, ( _, i ) => ( {
				name: `category-${ i }`,
				label: `Category ${ i }`,
				link: '#',
			} ) ) }
			selectedCategory="category-2"
			buttons={ [
				{
					icon: ImgStar,
					label: 'Discover',
					link: '/',
				},
				{
					icon: ImgStar,
					label: 'All categories',
					link: '/',
				},
			] }
		/>
	);
}
```

## Props

Below is a list of supported props.

### `list`
An array of objects, each representing a navigation link:

```
{
	name: string; // Acts as an `id` and is primarily used for highlighting the active item.
	label?: string; // The text displayed on the link.
	link: string; // The URL that the link points to.
}[]
```


### `selectedCategory`

Type: `string`

This property should match the `name` of one of the items in the `list` array to indicate the currently active category.

### `buttons`
An optional array of additional link objects to prepend to the main list of links:
```
{
	icon: string; // The icon displayed before the label.
	label: string; // The text displayed on the link.
	link: string; // The URL that the link points to.
}[] | undefined
```

