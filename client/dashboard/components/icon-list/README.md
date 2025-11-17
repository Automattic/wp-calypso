# IconList Component

A generic list component that displays items with optional icons/decorations, titles, and descriptions.

## Overview

The `IconList` component is a flexible list component that can be used to display a collection of items with optional decorative elements (icons, images), titles, and descriptions. It serves as the base component for `ActionList`, which extends it by adding action buttons.

## Components

### IconList

The main container component that wraps multiple `IconListItem` components.

### IconList.IconListItem

An individual item within the list, displaying optional decoration, title, description, and suffix content.

## Usage

### Basic Usage

```tsx
import IconList from '../components/icon-list';

<IconList>
	<IconList.IconListItem
		title="Item title"
		description="Item description"
	/>
	<IconList.IconListItem
		title="Another item"
		description="Another description"
	/>
</IconList>
```

### With Title and Description

```tsx
<IconList
	title="My List Title"
	description="This is a description of the list"
>
	<IconList.IconListItem
		title="Item title"
		description="Item description"
	/>
</IconList>
```

### With Icons

```tsx
import { Icon } from '@wordpress/components';
import { cog, page } from '@wordpress/icons';

<IconList>
	<IconList.IconListItem
		title="Settings"
		description="Configure your preferences"
		decoration={ <Icon icon={ cog } /> }
	/>
	<IconList.IconListItem
		title="Documentation"
		description="Read the docs"
		decoration={ <Icon icon={ page } /> }
	/>
</IconList>
```

### With Suffix Content

```tsx
<IconList>
	<IconList.IconListItem
		title="Item with badge"
		description="This item has a suffix"
		suffix={ <Badge>New</Badge> }
	/>
</IconList>
```

## Props

### IconListProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Optional title for the list |
| `description` | `string` | `undefined` | Optional description for the list |
| `children` | `React.ReactNode` | - | The list items (should be `IconList.IconListItem` components) |

### IconListItemProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | The main label that identifies the item |
| `description` | `string` | `undefined` | Optional supporting text |
| `decoration` | `React.ReactNode` | `undefined` | Optional visual element (icon, image) |
| `suffix` | `React.ReactNode` | `undefined` | Optional content to display at the end (badges, etc.) |
| `className` | `string` | `undefined` | Optional CSS class name(s) |

## Relationship with ActionList

The `ActionList` component extends `IconList` by using `IconListItem` as its base and adding action buttons via the `suffix` prop. If you need a list with actionable items (buttons), use `ActionList` instead.

```tsx
// IconList for display-only lists
<IconList>
	<IconList.IconListItem title="Display item" />
</IconList>

// ActionList for lists with actions
<ActionList>
	<ActionList.ActionItem
		title="Actionable item"
		actions={ <Button>Click me</Button> }
	/>
</ActionList>
```

## Styling

The component uses the following CSS classes:
- `.icon-list` - Main container
- `.icon-list__heading` - List title and description container
- `.icon-list__items` - Container for list items
- `.icon-list-item` - Individual list item
- `.icon-list-item__decoration` - Decoration container
- `.icon-list-item__suffix` - Suffix content container

