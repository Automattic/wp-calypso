# The `@automattic/dataviews` package

> This package is based on the `@wordpress/dataviews` package and extends its functionality. See the "Contributing to this package" section for more info.

The DataViews package offers two React components and a few utilities to work with a list of data:

-   `DataViews`: to render the dataset using different types of layouts (table, grid, list) and interaction capabilities (search, filters, sorting, etc.).
-   `DataForm`: to edit the items of the dataset.

## Installation

Install the module

```bash
npm install @automattic/dataviews --save
```

## `DataViews`

<div class="callout callout-info">At <a href="https://wordpress.github.io/gutenberg/">WordPress Gutenberg's Storybook</a> there's an <a href="https://wordpress.github.io/gutenberg/?path=/docs/dataviews-dataviews--docs">example implementation of the Dataviews component</a>.</div>

**Important note** If you're trying to use the `DataViews` component in a WordPress plugin or theme and you're building your scripts using the `@wordpress/scripts` package, you need to import the components from `@automattic/dataviews/wp` instead of `@automattic/dataviews`.

### Usage

The `DataViews` component receives data and some other configuration to render the dataset. It'll call the `onChangeView` callback every time the user has interacted with the dataset in some way (sorted, filtered, changed layout, etc.):

![DataViews flow](https://developer.wordpress.org/files/2024/09/368600071-20aa078f-7c3d-406d-8dd0-8b764addd22a.png 'DataViews flow')

Example:

```jsx
const Example = () => {
	const onChangeView = () => {
		/* React to user changes. */
	};

	return (
		<DataViews
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ onChangeView }
			defaultLayouts={ defaultLayouts }
			actions={ actions }
			paginationInfo={ paginationInfo }
		/>
	);
};
```

### Properties

#### `data`: `Object[]`

A one-dimensional array of objects.

Example:

```js
const data = [
	{
		id: 1,
		title: 'Title',
		author: 'Admin',
		date: '2012-04-23T18:25:43.511Z',
	},
	{
		/* ... */
	},
];
```

The data can come from anywhere, from a static JSON file to a dynamic source like a HTTP Request. It's the consumer's responsibility to query the data source appropriately and update the dataset based on the user's choices for sorting, filtering, etc.

Each record should have an `id` that identifies them uniquely. If they don't, the consumer should provide the `getItemId` property to `DataViews`: a function that returns an unique identifier for the record.

#### `getItemId`: `function`

A function that receives an item and returns a unique identifier for it.

It's optional. The field will get a default implementation by `DataViews` that returns the value of the `item[ id ]`.

Example:

```js
// Custom getItemId function.
{
	getItemId={ ( item ) => item.name ?? item.id }
}
```

#### `getItemLevel`: `function`

A function that receives an item and returns its hierarchical level. It's optional, but this property must be passed for DataViews to display the hierarchical levels of the data if `view.showLevels` is true.

Example:

```js
// Example implementation
{
	getItemLevel={ ( item ) => item.level }
}
```

#### `fields`: `Object[]`

The fields describe the visible items for each record in the dataset and how they behave (how to sort them, display them, etc.). See "Fields API" for a description of every property.

Example:

```js
const STATUSES = [
	{ value: 'draft', label: __( 'Draft' ) },
	{ value: 'future', label: __( 'Scheduled' ) },
	{ value: 'pending', label: __( 'Pending Review' ) },
	{ value: 'private', label: __( 'Private' ) },
	{ value: 'publish', label: __( 'Published' ) },
	{ value: 'trash', label: __( 'Trash' ) },
];
const fields = [
	{
		id: 'title',
		label: 'Title',
		enableHiding: false,
	},
	{
		id: 'date',
		label: 'Date',
		render: ( { item } ) => {
			return <time>{ getFormattedDate( item.date ) }</time>;
		},
	},
	{
		id: 'author',
		label: 'Author',
		render: ( { item } ) => {
			return <a href="...">{ item.author }</a>;
		},
		elements: [
			{ value: 1, label: 'Admin' },
			{ value: 2, label: 'User' },
		],
		filterBy: {
			operators: [ 'is', 'isNot' ],
		},
		enableSorting: false,
	},
	{
		id: 'status',
		label: 'Status',
		getValue: ( { item } ) =>
			STATUSES.find( ( { value } ) => value === item.status )?.label ??
			item.status,
		elements: STATUSES,
		filterBy: {
			operators: [ 'isAny' ],
		},
		enableSorting: false,
	},
];
```

#### `view`: `Object`

The view object configures how the dataset is visible to the user.

Example:

```js
const view = {
	type: 'table',
	search: '',
	filters: [
		{ field: 'author', operator: 'is', value: 2 },
		{ field: 'status', operator: 'isAny', value: [ 'publish', 'draft' ] },
	],
	page: 1,
	perPage: 5,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	titleField: 'title',
	fields: [ 'author', 'status' ],
	layout: {},
};
```

Properties:

-   `type`: view type, one of `table`, `grid`, `list`. See "Layout types".
-   `search`: the text search applied to the dataset.
-   `filters`: the filters applied to the dataset. Each item describes:
    -   `field`: which field this filter is bound to.
    -   `operator`: which type of filter it is. See "Operator types".
    -   `value`: the actual value selected by the user.
-   `perPage`: number of records to show per page.
-   `page`: the page that is visible.
-   `sort`:

    -   `field`: the field used for sorting the dataset.
    -   `direction`: the direction to use for sorting, one of `asc` or `desc`.

-   `titleField`: The id of the field representing the title of the record.
-   `mediaField`: The id of the field representing the media of the record.
-   `descriptionField`: The id of the field representing the description of the record.
-   `showTitle`: Whether the title should be shown in the UI. `true` by default.
-   `showMedia`: Whether the media should be shown in the UI. `true` by default.
-   `showDescription`: Whether the description should be shown in the UI. `true` by default.
-   `showLevels`: Whether to display the hierarchical levels for the data. `false` by default. See related `getItemLevel` DataView prop.
-   `fields`: a list of remaining field `id` that are visible in the UI and the specific order in which they are displayed.
-   `layout`: config that is specific to a particular layout type.

##### Properties of `layout`

| Properties of `layout`                                                              | Table | Grid | List |
| ----------------------------------------------------------------------------------- | ----- | ---- | ---- |
| `badgeFields`: a list of field's `id` to render without label and styled as badges. |       | ✓    |      |
| `styles`: additional `width`, `maxWidth`, `minWidth` styles for each field column.  | ✓     |      |      |

#### `onChangeView`: `function`

Callback executed when the view has changed. It receives the new view object as a parameter.

The view is a representation of the visible state of the dataset: what type of layout is used to display it (table, grid, etc.), how the dataset is filtered, and how it is sorted or paginated. The consumer is responsible for using the view config to query the data provider and ensure the user decisions (sort, pagination, filters, etc.) are respected.

The following example shows how a view object is used to query the WordPress REST API via the entities abstraction. The same can be done with any other data provider.

```js
function MyCustomPageTable() {
	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 5,
		page: 1,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		search: '',
		filters: [
			{ field: 'author', operator: 'is', value: 2 },
			{
				field: 'status',
				operator: 'isAny',
				value: [ 'publish', 'draft' ],
			},
		],
		titleField: 'title',
		fields: [ 'author', 'status' ],
		layout: {},
	} );

	const queryArgs = useMemo( () => {
		const filters = {};
		view.filters.forEach( ( filter ) => {
			if ( filter.field === 'status' && filter.operator === 'isAny' ) {
				filters.status = filter.value;
			}
			if ( filter.field === 'author' && filter.operator === 'is' ) {
				filters.author = filter.value;
			}
		} );
		return {
			per_page: view.perPage,
			page: view.page,
			_embed: 'author',
			order: view.sort?.direction,
			orderby: view.sort?.field,
			search: view.search,
			...filters,
		};
	}, [ view ] );

	const { records } = useEntityRecords( 'postType', 'page', queryArgs );

	return (
		<DataViews
			data={ records }
			view={ view }
			onChangeView={ setView }
			// ...
		/>
	);
}
```

#### `actions`: `Object[]`

A list of actions that can be performed on the dataset. See "Actions API" for more details.

Example:

```js
const actions = [
	{
		id: 'view',
		label: 'View',
		isPrimary: true,
		icon: <Icon icon={ view } />,
		isEligible: ( item ) => item.status === 'published',
		callback: ( items ) => {
			console.log( 'Viewing item:', items[ 0 ] );
		},
	},
	{
		id: 'edit',
		label: 'Edit',
		icon: <Icon icon={ edit } />,
		supportsBulk: true,
		callback: ( items ) => {
			console.log( 'Editing items:', items );
		},
	},
	{
		id: 'delete',
		label: 'Delete',
		isDestructive: true,
		supportsBulk: true,
		RenderModal: ( { items, closeModal, onActionPerformed } ) => (
			<div>
				<p>Are you sure you want to delete { items.length } item(s)?</p>
				<Button
					variant="primary"
					onClick={ () => {
						console.log( 'Deleting items:', items );
						onActionPerformed();
						closeModal();
					} }
				>
					Confirm Delete
				</Button>
			</div>
		),
	},
];
```

#### `paginationInfo`: `Object`

-   `totalItems`: the total number of items in the datasets.
-   `totalPages`: the total number of pages, taking into account the total items in the dataset and the number of items per page provided by the user.

#### `search`: `boolean`

Whether the search input is enabled. `true` by default.

#### `searchLabel`: `string`

What text to show in the search input. "Search" by default.

#### `isLoading`: `boolean`

Whether the data is loading. `false` by default.

#### `defaultLayouts`: `Record< string, view >`

This property provides layout information about active view types. If empty, this enables all layout types (see "Layout Types") with empty layout data.

For example, this is how you'd enable only the table view type:

```js
const defaultLayouts = {
	table: {
		showMedia: false,
	},
	grid: {
		showMedia: true,
	},
};
```

The `defaultLayouts` property should be an object that includes properties named `table`, `grid`, or `list`. These properties are applied to the view object each time the user switches to the corresponding layout.

#### `selection`: `string[]`

The list of selected items' ids.

If `selection` and `onChangeSelection` are provided, the `DataViews` component behaves like a controlled component. Otherwise, it behaves like an uncontrolled component.

#### `onChangeSelection`: `function`

Callback that signals the user selected one of more items. It receives the list of selected items' IDs as a parameter.

If `selection` and `onChangeSelection` are provided, the `DataViews` component behaves like a controlled component. Otherwise, it behaves like an uncontrolled component.

#### `isItemClickable`: `function`

A function that determines if a media field or a primary field is clickable. It receives an item as an argument and returns a boolean value indicating whether the item can be clicked.

#### `renderItemLink`: `React.ComponentType`

A render function used to render clickable items.

It can render regular links, but also allows integration with routing libraries (like TanStack Router or React Router).

The component receives the following props:

-   `item`: The data item that was clicked
-   Additional standard HTML anchor props (className, style, etc.)

```jsx
// Then use it in DataViews
<DataViews
	// ...other props
	renderItemLink={ ( { item, ...props } ) => (
		<Link to={ `/sites/${ item.slug }` } preload="intent" { ...props } />
	) }
/>;
```

#### `header`: React component

React component to be rendered next to the view config button.

### Composition modes

The `DataViews` component supports two composition modes:

-   **Controlled**: This is the default usage mode. `DataViews` renders a full layout out-of-the-box — including search, filters, view switcher, layout grid or table, actions, and pagination. It’s the simplest way to get started and requires minimal setup.

-   **Free composition**: This mode gives developers full control over the layout. You can compose your own UI using internal components — placing them exactly where they’re needed in your interface. This is useful for more advanced or custom layouts, while still relying on the same shared context for user interactions.

The component automatically detects the mode based on the `children` prop. If no `children` are passed, `DataViews` renders its internal layout (controlled mode). If `children` are provided, the component switches to free composition mode, skipping the default layout entirely.

In both modes, user interactions update the same `view` object and share the same behavior. Free composition components rely on context state and don’t require additional props to work, making them safe to use without extra boilerplate.

### Free composition

When you pass the `children` prop to the `DataViews` component, it enters free composition mode. In this mode, `DataViews` no longer renders its built-in layout — instead, it acts as a wrapper that provides access to internal state and shared behavior through context.

This allows you to build your own layout from scratch using the subcomponents exposed by `DataViews`. Each subcomponent automatically connects to the shared context, so you don't need to wire props manually. You can arrange these components however you want and combine them with your own custom elements.

This pattern enables full layout flexibility while keeping the data logic centralized.

The following components are available directly under `DataViews`:

-   `DataViews.Search`
-   `DataViews.FiltersToggle`
-   `DataViews.Filters`
-   `DataViews.Layout`
-   `DataViews.LayoutSwitcher`
-   `DataViews.Pagination`
-   `DataViews.BulkActionToolbar`
-   `DataViews.ViewConfig`

#### example

```jsx
import DataViews from '@automattic/dataviews';
import { __ } from '@wordpress/i18n';

const CustomLayout = () => {
	// Declare data, fields, etc.

	return (
		<DataViews
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ onChangeView }
			paginationInfo={ paginationInfo }
			defaultLayouts={ { table: {} } }
		>
			<h1>{ __( 'Free composition' ) }</h1>
			<DataViews.Search />
			<DataViews.FiltersToggle />
			<DataViews.Filters />
			<DataViews.Layout />
			<DataViews.Pagination />
		</DataViews>
	);
};
```

> You can render only the pieces you need, rearrange them freely, or combine them with custom components.

### Accessibility considerations

All `DataViews` subcomponents are designed with accessibility in mind — including keyboard interactions, focus management, and semantic roles. Components like `Search`, `Pagination`, `FiltersToggle`, and `Filters` already handle these responsibilities internally and can be safely used in custom layouts.

When using free composition, developers are responsible for the outer structure of the layout.

Developers don't need to worry about the internal accessibility logic for individual features. The core behaviors — like search semantics, filter toggles, or pagination focus — are encapsulated.

`FiltersToggle` controls the visibility of the filters panel, and `Filters` renders the actual filters inside it. They work together and should always be used as a pair. While their internal behavior is accessible by default, how they’re positioned and grouped in custom layouts may affect the overall experience — especially for assistive technologies. Extra care is recommended.

## `DataForm`

<div class="callout callout-info">At <a href="https://wordpress.github.io/gutenberg/">WordPress Gutenberg's Storybook</a> there's and <a href="https://wordpress.github.io/gutenberg/?path=/docs/dataviews-dataform--docs">example implementation of the DataForm component</a>.</div>

### Usage

```jsx
const Example = () => {
	// Declare data, fields, etc.

	return (
		<DataForm
			data={ data }
			fields={ fields }
			form={ form }
			onChange={ onChange }
		/>
	);
};
```

### Properties

#### `data`: `Object`

A single item to be edited.

It can be thought of as a single record coming from the `data` property of `DataViews` — though it doesn't need to be. It can be totally separated or a mix of records if your app supports bulk editing.

#### `fields`: `Object[]`

The fields describe which parts of the data are visible and how they behave (how to edit them, validate them, etc.). See "Fields API" for a description of every property.

Example:

```js
const fields = [
	{
		id: 'title',
		type: 'text',
		label: 'Title',
	},
	{
		id: 'date',
		type: 'datetime',
		label: 'Date',
	},
	{
		id: 'author',
		type: 'text'
		label: 'Author',
		elements: [
			{ value: 1, label: 'Admin' },
			{ value: 2, label: 'User' },
		],
	},
];
```

#### `form`: `Object[]`

-   `type`: either `regular` or `panel`.
-   `labelPosition`: either `side`, `top`, or `none`.
-   `fields`: a list of fields ids that should be rendered. Field ids can also be defined as an object and allow you to define a `layout`, `labelPosition` or `children` if displaying combined fields. See "Form Field API" for a description of every property.

Example:

```js
const form = {
	type: 'panel',
	fields: [
		'title',
		'data',
		{
			id: 'status',
			label: 'Status & Visibility',
			children: [ 'status', 'password' ],
		},
		{
			id: 'featured_media',
			layout: 'regular',
		},
	],
};
```

#### `onChange`: `function`

Callback function that receives an object with the edits done by the user.

Example:

```js
const data = {
	id: 1,
	title: 'Title',
	author: 'Admin',
	date: '2012-04-23T18:25:43.511Z',
};

const onChange = ( edits ) => {
	/*
	 * edits will contain user edits.
	 * For example, if the user edited the title
	 * edits will be:
	 *
	 * {
	 *   title: 'New title'
	 * }
	 *
	 */
};

return (
	<DataForm
		data={ data }
		fields={ fields }
		form={ form }
		onChange={ onChange }
	/>
);
```

## Utilities

### `filterSortAndPaginate`

Utility to apply the view config (filters, search, sorting, and pagination) to a dataset client-side.

Parameters:

-   `data`: the dataset, as described in the "data" property of DataViews.
-   `view`: the view config, as described in the "view" property of DataViews.
-   `fields`: the fields config, as described in the "fields" property of DataViews.

Returns an object containing:

-   `data`: the new dataset, with the view config applied.
-   `paginationInfo`: object containing the following properties:
    -   `totalItems`: total number of items for the current view config.
    -   `totalPages`: total number of pages for the current view config.

### `isItemValid`

Utility is used to determine whether or not the given item's value is valid according to the current fields and form configuration.

Parameters:

-   `item`: the item, as described in the "data" property of DataForm.
-   `fields`: the fields config, as described in the "fields" property of DataForm.
-   `form`: the form config, as described in the "form" property of DataForm.

Returns a boolean indicating if the item is valid (true) or not (false).

## Actions API

### `id`

The unique identifier of the action.

-   Type: `string`
-   Required
-   Example: `move-to-trash`

### `label`

The user facing description of the action.

-   Type: `string | function`
-   Required
-   Example:

```js
{
	label: Move to Trash
}
```

or

```js
{
	label: ( items ) => ( items.length > 1 ? 'Delete items' : 'Delete item' );
}
```

### `isPrimary`

Whether the action should be displayed inline (primary) or only displayed in the "More actions" menu (secondary).

-   Type: `boolean`
-   Optional

### `icon`

Icon to show for primary actions.

-   Type: SVG element
-   Required for primary actions, optional for secondary actions.

### `isEligible`

Function that determines whether the action can be performed for a given record.

-   Type: `function`
-   Optional. If not present, action is considered eligible for all items.
-   Example:

```js
{
	isEligible: ( item ) => item.status === 'published';
}
```

### `isDestructive`

Whether the action can delete data, in which case the UI communicates it via a red color.

-   Type: `boolean`
-   Optional

### `supportsBulk`

Whether the action can operate over multiple items at once.

-   Type: `boolean`
-   Optional
-   Default: `false`

### `disabled`

Whether the action is disabled.

-   Type: `boolean`
-   Optional
-   Default: `false`

### `context`

Where this action would be visible.

-   Type: `string`
-   Optional
-   One of: `list`, `single`

### `callback`

Function that performs the required action.

-   Type: `function`
-   Either `callback` or `RenderModal` must be provided. If `RenderModal` is provided, `callback` will be ignored
-   Example:

```js
{
	callback: ( items, { onActionPerformed } ) => {
		// Perform action.
		onActionPerformed?.( items );
	};
}
```

### `RenderModal`

Component to render UI in a modal for the action.

-   Type: `ReactElement`
-   Either `callback` or `RenderModal` must be provided. If `RenderModal` is provided, `callback` will be ignored.
-   Example:

```jsx
{
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const onSubmit = ( event ) => {
			event.preventDefault();
			// Perform action.
			closeModal?.();
			onActionPerformed?.( items );
		};
		return (
			<form onSubmit={ onSubmit }>
				<p>Modal UI</p>
				<HStack>
					<Button variant="tertiary" onClick={ closeModal }>
						Cancel
					</Button>
					<Button variant="primary" type="submit">
						Submit
					</Button>
				</HStack>
			</form>
		);
	};
}
```

### `hideModalHeader`

Controls visibility of the modal's header when using `RenderModal`.

-   Type: `boolean`
-   Optional
-   When false and using `RenderModal`, the action's label is used in modal header

### `modalHeader`

The header text to show in the modal.

-   Type: `string`
-   Optional

### `modalSize`

Specifies the size of the modal window when displaying action content using `RenderModal`.

-   Type: `string`
-   Optional
-   Default: `'medium'`
-   One of: `'small'`, `'medium'`, `'large'`, `'fill'`

Example:

```js
{
	modalSize: 'large';
}
```

### `modalFocusOnMount`

Specifies the focus on mount property of the modal.

-   Type: `boolean` | `string`
-   Optional
-   Default: `true`
-   One of: `true` | `false` | `'firstElement'` | `'firstContentElement'`

Example:

```js
{
	modalFocusOnMount: 'firstContentElement';
}
```

## Fields API

### `id`

The unique identifier of the field.

-   Type: `string`.
-   Required.

Example:

```js
{
	id: 'field_id';
}
```

### `type`

Field type. One of `text`, `integer`, `datetime`.

If a field declares a `type`, it gets default implementations for the `sort`, `isValid`, and `Edit` functions if no other values are specified.

-   Type: `string`.
-   Optional.

Example:

```js
{
	type: 'text';
}
```

### `label`

The field's name. This will be used across the UI.

-   Type: `string`.
-   Optional.
-   Defaults to the `id` value.

Example:

```js
{
	label: 'Title';
}
```

### `header`

React component used by the layouts to display the field name — useful to add icons, etc. It's complementary to the `label` property.

-   Type: React component.
-   Optional.
-   Defaults to the `label` value.
-   Props: none.
-   Returns a React element that represents the field's name.

Example:

```js
{
	header: () => {
		/* Returns a react element. */
	};
}
```

### `getValue`

React component that returns the value of a field. This value is used to sort or filter the fields.

-   Type: React component.
-   Optional.
-   Defaults to `item[ id ]`.
-   Props:
    -   `item` value to be processed.
-   Returns a value that represents the field.

Example:

```js
{
	getValue: ( { item } ) => {
		/* The field's value.  */
	};
}
```

### `render`

React component that renders the field. This is used by the layouts.

-   Type: React component.
-   Optional.
-   Defaults to `getValue`.
-   Props
    -   `item` value to be processed.
-   Returns a React element that represents the field's value.

Example:

```js
{
	render: ( { item } ) => {
		/* React element to be displayed. */
	};
}
```

### `Edit`

React component that renders the control to edit the field.

-   Type: React component | `string`. If it's a string, it needs to be one of `text`, `integer`, `datetime`, `radio`, `select`.
-   Required by DataForm. Optional if the field provided a `type`.
-   Props:
    -   `data`: the item to be processed
    -   `field`: the field definition
    -   `onChange`: the callback with the updates
    -   `hideLabelFromVision`: boolean representing if the label should be hidden
-   Returns a React element to edit the field's value.

Example:

```js
// A custom control defined by the field.
{
	Edit: ( { data, field, onChange, hideLabelFromVision } ) => {
		const value = field.getValue( { item: data } );

		return (
			<CustomTimePicker
				value={ value }
				onChange={ onChange }
				hideLabelFromVision
			/>
		);
	};
}
```

```js
// Use one of the core controls.
{
	Edit: 'radio';
}
```

```js
// Edit is optional when field's type is present.
// The field will use the default Edit function for text.
{
	type: 'text';
}
```

```js
// Edit can be provided even if field's type is present.
// The field will use its own custom control.
{
	type: 'text',
	Edit: 'radio'
}
```

### `sort`

Function to sort the records.

-   Type: `function`.
-   Optional.
-   Args
    -   `a`: the first item to compare
    -   `b`: the second item to compare
    -   `direction`: either `asc` (ascending) or `desc` (descending)
-   Returns a number where:
    -   a negative value indicates that `a` should come before `b`
    -   a positive value indicates that `a` should come after `b`
    -   0 indicates that `a` and `b` are considered equal

Example:

```js
// A custom sort function defined by the field.
{
	sort: ( a, b, direction ) => {
		return direction === 'asc'
			? a.localeCompare( b )
			: b.localeCompare( a );
	};
}
```

```js
// If field type is provided,
// the field gets a default sort function.
{
	type: 'number';
}
```

```js
// Even if a field type is provided,
// fields can override the default sort function assigned for that type.
{
	type: 'number';
	sort: ( a, b, direction ) => {
		/* Custom sort */
	};
}
```

### `isValid`

Function to validate a field's value.

-   Type: function.
-   Optional.
-   Args
    -   `item`: the data to validate
    -   `context`: an object containing the following props:
        -   `elements`: the elements defined by the field
-   Returns a boolean, indicating if the field is valid or not.

Example:

```js
// Custom isValid function.
{
	isValid: ( item, context ) => {
		return !! item;
	};
}
```

```js
// If the field defines a type,
// it'll get a default isValid function for the type.
{
	type: 'number',
}
```

```js
// Even if the field provides a type,
// the field can override the default isValid function.
{
	type: 'number',
	isValid: ( item, context ) => { /* Custom function. */ }
}
```

### `isVisible`

Function that indicates if the field should be visible.

-   Type: `function`.
-   Optional.
-   Args
    -   `item`: the data to be processed
-   Returns a `boolean` indicating if the field should be visible (`true`) or not (`false`).

Example:

```js
// Custom isVisible function.
{
	isVisible: ( item ) => {
		/* Custom implementation. */
	};
}
```

### `enableSorting`

Boolean indicating if the field is sortable.

-   Type: `boolean`.
-   Optional.
-   Defaults to `true`.

Example:

```js
{
	enableSorting: true;
}
```

### `enableHiding`

Boolean indicating if the field can be hidden.

-   Type: `boolean`.
-   Optional.
-   Defaults to `true`.

Example:

```js
{
	enableHiding: true;
}
```

### `enableGlobalSearch`

Boolean indicating if the field is searchable.

-   Type: `boolean`.
-   Optional.
-   Defaults to `false`.

Example:

```js
{
	enableGlobalSearch: true;
}
```

### `elements`

List of valid values for a field. If provided, it creates a DataViews' filter for the field. DataForm's edit control will also use these values. (See `Edit` field property.)

-   Type: `array` of objects.
-   Optional.
-   Each object can have the following properties:
    -   `value`: the value to match against the field's value. (Required)
    -   `label`: the name to display to users. (Required)
    -   `description`: optional, a longer description of the item.

Example:

```js
{
	elements: [
		{ value: '1', label: 'Product A' },
		{ value: '2', label: 'Product B' },
		{ value: '3', label: 'Product C' },
		{ value: '4', label: 'Product D' },
	];
}
```

### `filterBy`

Configuration of the filters.

-   Type: `object`.
-   Optional.
-   Properties:
    -   `operators`: the list of operators supported by the field. See "operators" below. A filter will support the `isAny` and `isNone` multi-selection operators by default.
    -   `isPrimary`: boolean, optional. Indicates if the filter is primary. A primary filter is always visible and is not listed in the "Add filter" component, except for the list layout where it behaves like a secondary filter.

Operators:

| Operator   | Selection      | Description                                                             | Example                                            |
| ---------- | -------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `is`       | Single item    | `EQUAL TO`. The item's field is equal to a single value.                | Author is Admin                                    |
| `isNot`    | Single item    | `NOT EQUAL TO`. The item's field is not equal to a single value.        | Author is not Admin                                |
| `isAny`    | Multiple items | `OR`. The item's field is present in a list of values.                  | Author is any: Admin, Editor                       |
| `isNone`   | Multiple items | `NOT OR`. The item's field is not present in a list of values.          | Author is none: Admin, Editor                      |
| `isAll`    | Multiple items | `AND`. The item's field has all of the values in the list.              | Category is all: Book, Review, Science Fiction     |
| `isNotAll` | Multiple items | `NOT AND`. The item's field doesn't have all of the values in the list. | Category is not all: Book, Review, Science Fiction |
| `lessThan`           | Single item    | `LESS THAN`. The item's field is numerically less than a single value.      | Age is less than 18                                |
| `greaterThan`        | Single item    | `GREATER THAN`. The item's field is numerically greater than a single value.| Age is greater than 65                             |
| `lessThanOrEqual`    | Single item    | `LESS THAN OR EQUAL TO`. The item's field is numerically less than or equal to a single value. | Age is less than or equal to 18         |
| `greaterThanOrEqual` | Single item    | `GREATER THAN OR EQUAL TO`. The item's field is numerically greater than or equal to a single value. | Age is greater than or equal to 65      |

`is`, `isNot`, `lessThan`, `greaterThan`, `lessThanOrEqual`, and `greaterThanOrEqual` are single-selection operators, while `isAny`, `isNone`, `isAll`, and `isNotAll` are multi-selection. A filter with no operators declared will support the `isAny` and `isNone` multi-selection operators by default. A filter cannot mix single-selection & multi-selection operators; if a single-selection operator is present in the list of valid operators, the multi-selection ones will be discarded, and the filter won't allow selecting more than one item.

Example:

```js
// Set a filter as primary.
{
	filterBy: {
		isPrimary: true;
	}
}
```

```js
// Configure a filter as single-selection.
{
	filterBy: {
		operators: [ `is`, `isNot` ];
	}
}
```

```js
// Configure a filter as multi-selection with all the options.
{
	filterBy: {
		operators: [ `isAny`, `isNone`, `isAll`, `isNotAll` ];
	}
}
```

## Form Field API

### `id`

The unique identifier of the field.

-   Type: `string`.
-   Required.

Example:

```js
{
	id: 'field_id';
}
```

### `layout`

The same as the `form.type`, either `regular` or `panel` only for the individual field. It defaults to `form.type`.

-   Type: `string`.

Example:

```js
{
	id: 'field_id',
	layout: 'regular'
}
```

### `labelPosition`

The same as the `form.labelPosition`, either `side`, `top`, or `none` for the individual field. It defaults to `form.labelPosition`.

-   Type: `string`.

Example:

```js
{
	id: 'field_id',
	labelPosition: 'none'
}
```

### `label`

The label used when displaying a combined field, this requires the use of `children` as well.

-   Type: `string`.

Example:

```js
{
	id: 'field_id',
	label: 'Combined Field',
	children: [ 'field1', 'field2' ]
}
```

### `children`

Groups a set of fields defined within children. For example if you want to display multiple fields within the Panel dropdown you can use children ( see example ).

-   Type: `Array< string | FormField >`.

Example:

```js
{
	id: 'status',
	layout: 'panel',
	label: 'Combined Field',
	children: [ 'field1', 'field2' ],
}
```

## Contributing to this package

This package is based on the [`@wordpress/dataviews` package](https://www.npmjs.com/package/@wordpress/dataviews). We aim to synchronize changes from upstream (Gutenberg repo, `@wordpress/dataviews` package) while extending its core functionality.

There's two workflows: adding new features to this package and synchronizing changes from upstream. See [SYNC.md](https://github.com/Automattic/wp-calypso/blob/trunk/packages/dataviews/SYNC.md) for details about the second workflow.

-   When adding new features, document every change in the `CHANGELOG.automattic.md` file.
-   When synchronizing changes from upstream, document it in the `CHANGELOG.automattic.md` as well. For example, add a line such as `Bring changes from @wordpress/dataviews X.Y.Z`. Ideally, synchronizations should happen every time there's new release of `@wordpress/packages`, as this makes it easier to pinpoint changes. If it brings upstream changes that cannot be pinpointed to a package release, document the upstream git commit that's being pulled into this package.

This is an individual package that's part of the wp-calypso project. The project is organized as a monorepo. It's made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [wp-calypso](https://github.com/automattic/wp-calypso/) as well as other software projects. To find out more about contributing to this package or wp-calypso as a whole, please read the project's main [contributor guide](https://github.com/Automattic/wp-calypso/blob/trunk/docs/CONTRIBUTING.md).
