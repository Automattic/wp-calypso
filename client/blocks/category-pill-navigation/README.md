# Category Pill Navigation

This component can be used to display a set of categories or tags as pills in an horizontal way. Each pill accepts a link, and the whole navigation bar can be scrolled.

## How to use

```js
import { Icon, starEmpty as iconStar, category as iconCategory } from '@wordpress/icons';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';

function render() {
	return (
		<CategoryPillNavigation
			categories={ Array.from( { length: 15 }, ( _, i ) => ( {
				id: `category-${ i }`,
				label: `Category ${ i + 1 }`,
				link: '#',
			} ) ) }
			selectedCategory="category-2"
			buttons={ [
				{
					id: 'discover',
					icon: <Icon icon={ iconStar } size={ 30 } />,
					label: 'Discover',
					link: '/',
				},
				{
					id: 'all',
					icon: <Icon icon={ iconCategory } size={ 26 } />,
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

### `categories`
An array of objects, each representing a navigation link:

```
{
	id: string; // Is used for highlighting the active item
	label?: string; // The text displayed on the link
	link: string; // The URL that the link points to
}[]
```


### `selectedCategoryId`

Type: `string`

This property should match the `id` of one of the items in the `categories` array to indicate the currently active category.

### `buttons`
An optional array of additional link objects to prepend to the main list of links:
```
{
	id: string; // The identifier of the button, typically used for click tracking
	icon: string; // The icon displayed before the label
	label: string; // The text displayed on the link
	link: string; // The URL that the link points to
}[] | undefined
```

