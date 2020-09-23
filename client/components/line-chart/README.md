# LineChart

This component encapsulates a D3 based line chart graph

## Usage

```jsx
const data = [
	[
		{ date: 1528462681168, value: 21 },
		{ date: 1528549081168, value: 18 },
		{ date: 1528635481168, value: 37 },
		{ date: 1528721881168, value: 38 },
		{ date: 1528808281168, value: 43 },
		{ date: 1528894681168, value: 44 },
		{ date: 1528981081168, value: 17 },
		{ date: 1529067481168, value: 27 },
		{ date: 1529153881168, value: 26 },
		{ date: 1529240281168, value: 24 },
	],
	[
		{ date: 1528462681168, value: 25 },
		{ date: 1528549081168, value: 37 },
		{ date: 1528635481168, value: 23 },
		{ date: 1528721881168, value: 34 },
		{ date: 1528808281168, value: 3 },
		{ date: 1528894681168, value: 4 },
		{ date: 1528981081168, value: 1 },
		{ date: 1529067481168, value: 9 },
		{ date: 1529153881168, value: 20 },
		{ date: 1529240281168, value: 16 },
	],
	[
		{ date: 1528462681168, value: 7 },
		{ date: 1528549081168, value: 1 },
		{ date: 1528635481168, value: 32 },
		{ date: 1528721881168, value: 40 },
		{ date: 1528808281168, value: 38 },
		{ date: 1528894681168, value: 31 },
		{ date: 1528981081168, value: 17 },
		{ date: 1529067481168, value: 48 },
		{ date: 1529153881168, value: 21 },
		{ date: 1529240281168, value: 46 },
	],
];

const legendInfo = [ { name: 'Line #1' }, { name: 'Line #2' }, { name: 'Line #3' } ];

<LineChart data={ data } fillArea={ false } legendInfo={ legendInfo } />;
```

### Props

| Name                      | Type       | Default                                        | Description                                                                                                   |
| ------------------------- | ---------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `aspectRatio`             | `number`   | 2                                              | Aspect ratio between width and height of the graph                                                            |
| `data`                    | `array`    | false                                          | Graph data for line chart. List of lists of points, each point should be of the shape: `{ date, value }`      |
| `fillArea`                | `bool`     | false                                          | Whether to fill the area under the curve                                                                      |
| `legendInfo`              | `array`    | false                                          | Information to display for the legend of the graph, each item should be of the shape: `{ name, description }` |
| `margin`                  | `object`   | `{ top: 30, right: 30, bottom: 30, left: 30 }` | Margin                                                                                                        |
| `renderTooltipForDatanum` | `function` | `datum => datum.value`                         | Function that returns a tooltip content from a given point                                                    |

### General guidelines

- In order for the component to re-render, the data prop should change ( the array itself, not just it's contents ), the component does shallow comparison.

## Related components

- This component uses the [LineChartLegend](./legend) component for rendering the legend.
- This component is similar to the [PieChart](./pie-chart) component.
