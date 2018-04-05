# Pie Chart

This component renders a dataset as a pie chart.

## Props 

* **data** — (required) Array of objects holding the data
	* **value** - (required) (Number) Value of the datum
	* **name** - (required) (String) Name to represent the datum
	* **description** - (optional) (String) A longer description of the datum 
* **title** — (optional) (String) Title for the chart

## Usage

```jsx
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PieChart from 'components/pie-chart';

export default class Example extends Component {
	render() {
		const data = [
			{
				value: 189,
				name: translate( 'Direct' ),
				description:
					translate(
						'Customers who find your listing searching for your business or address'
					),
			},
			{
				value: 362,
				name: translate( 'Discovery' ),
				description:
					translate(
						'Customers who find your listing searching for a category, product, or service'
					),
			},
			{
				value: 122,
				name: translate( 'Referral' ),
				description:
					translate(
						'Customers who find your listing by being referred from another type of search'
					),
			}
		];

		const total = data.reduce( ( result, datum ) => result + datum.value, 0 );

		return (
			<PieChart
				data={ data }
				title={ translate( '%(total)s Total Searches', { args: { total } } ) }
			/>
		);
	}
}
```

## Limits

Currently there are only 3 colors used in a pie chart. While there is no hard limit on exceeding this limit, it will make identifying the corresponding section difficult.
