Grid
===

A grid component to create predictable layouts and visual consistency across pages. The columns and gutters behave according to the following table:

Breakpoint Range (dp) | Columns | Size | Gutters
--- | --- | ---
0 - 480 | 4 | xs | 16
481 - 660 | 4 | sm | 16
661 - 1040 | 8 | md | 24 
1041 - 1280 | 12| lg | 24
1280 + | 12 | xl | 24

## Usage

```jsx
import Grid from 'grid';

export default function MyBasicGrid() {
	return (
		<Grid container>
			<Grid item xs={ 4 } lg={ 6 }> Item 1 </Grid>
			<Grid item xs={ 4 } lg={ 6 }> Item 2 </Grid>
			<Grid item xs={ 4 } lg={ 6 }> Item 3 </Grid>
		</Grid>
	);
}
```

### Props


Name | Type | Default | Description
--- | --- | --- | ---
`alignContent` | `enum` | `stretch` | Defines the `align-content` style property. Can be `stretch`, `center`, `flex-start`, `flex-end`, `space-between`, `space-around`
`alignItems` | `enum` | `stretch` | Defines the `align-items` style property. Can be `flex-start`, `center`, `flex-end`, `stretch`, `baseline`
`children` | `node` | | The content of the component
`classes` | `object` | | Override or extend the styles applied to the component
`component` | `Component` | `div` | The component used for the root node. Either a string to use a DOM element or a component.
`container` | `bool` | true | If `true`, the component will have the flex container behavior. Containers should wrap items. 
`direction` | `string` | false | Can be `row`, `row-reverse`, `column`, `column-reverse`
`item` | `bool` | false | If `true`, the component will have the flex item behavior. Items should be wrapped within a container.
`justifyContent` | `string` | null | Defines the `justify-content` style property. Can be `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` 
`lg`\* | `enum` | `false` | Defines the number of columns an item spans at the `lg` and wider if not overridden. Can be `false`, `auto`, `true`, 1 - 12
`md`\* | `enum` | `false` | Defines the number of columns an item spans at the `md` and wider if not overridden. Can be `false`, `auto`, `true`, 1 - 8 
`sm`\* | `enum` | `false` | Defines the number of columns an item spans at the `sm` and wider if not overridden. Can be `false`, `auto`, `true`, 1 - 4
`wrap` | `string` | `wrap` | Defines the `flex-wrap` style property, applied to all screen sizes. Can be `nowrap`, `wrap`, `wrap-reverse`
`xl`\* | `enum` | `false` | Defines the number of columns an item spans at the `xl` and wider if not overridden. Can be `false`, `auto`, `true`, 1 - 12
`xs`\* | `enum` | `false` | Defines the number of columns an item spans at the `xs` and wider if not overridden. Can be `false`, `auto`, `true`, 1 - 4

Any other properties supplied will be spread to the root element (native element).

\* If no column span is specified, the `<Grid item/>` will fallback to a default span size of 4 columns.
