# LineChart

This component encapsulates a D3 based line chart graph

## Usage

```jsx
const data = [
	[
		{ date: 1528462681168, value: 21, pointStyle: 'triangle' },
		{ date: 1528549081168, value: 18, pointStyle: 'triangle' },
		{ date: 1528635481168, value: 37, pointStyle: 'triangle' },
		{ date: 1528721881168, value: 38, pointStyle: 'triangle' },
		{ date: 1528808281168, value: 43, pointStyle: 'triangle' },
		{ date: 1528894681168, value: 44, pointStyle: 'triangle' },
		{ date: 1528981081168, value: 17, pointStyle: 'triangle' },
		{ date: 1529067481168, value: 27, pointStyle: 'triangle' },
		{ date: 1529153881168, value: 26, pointStyle: 'triangle' },
		{ date: 1529240281168, value: 24, pointStyle: 'triangle' },
	],
	[
		{ date: 1528462681168, value: 25, pointStyle: 'circle' },
		{ date: 1528549081168, value: 37, pointStyle: 'circle' },
		{ date: 1528635481168, value: 23, pointStyle: 'circle' },
		{ date: 1528721881168, value: 34, pointStyle: 'circle' },
		{ date: 1528808281168, value: 3, pointStyle: 'circle' },
		{ date: 1528894681168, value: 4, pointStyle: 'circle' },
		{ date: 1528981081168, value: 1, pointStyle: 'circle' },
		{ date: 1529067481168, value: 9, pointStyle: 'circle' },
		{ date: 1529153881168, value: 20, pointStyle: 'circle' },
		{ date: 1529240281168, value: 16, pointStyle: 'circle' },
	],
	[
		{ date: 1528462681168, value: 7, pointStyle: 'square' },
		{ date: 1528549081168, value: 1, pointStyle: 'square' },
		{ date: 1528635481168, value: 32, pointStyle: 'square' },
		{ date: 1528721881168, value: 40, pointStyle: 'square' },
		{ date: 1528808281168, value: 38, pointStyle: 'square' },
		{ date: 1528894681168, value: 31, pointStyle: 'square' },
		{ date: 1528981081168, value: 17, pointStyle: 'square' },
		{ date: 1529067481168, value: 48, pointStyle: 'square' },
		{ date: 1529153881168, value: 21, pointStyle: 'square' },
		{ date: 1529240281168, value: 46, pointStyle: 'square' },
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
