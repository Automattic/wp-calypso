# StatsSparkline

The `StatsSparkline` block renders an image of a chart representing hourly views for a given site.

## Usage

```jsx
import StatsSparkline from 'calypso/blocks/stats-sparkline';

<StatsSparkline className="my-awesome-component__sparkline" siteId="777" />;
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The site ID to display the sparkline for.

### `className`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Optional className that is applied to the sparkline image.
