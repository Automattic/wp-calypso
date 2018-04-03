# Pie Chart

This component renders a dataset as a pie chart.

## Props 

* **data** — (required) Array of objects holding the data
	* **value** - (required) (Number) the value of the datum
	* **name** - (required) (String) A name to represent the datum
	* **description** - (optional) (String) A longer description of the datum 
* **title** — (optional) title for the chart. No additional work is done by the pie chart, so if you want the total like in the exmaple it will have to be done before the prop is passed to the chart

## Usage

```jsx

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PieChart from 'components/pie-chart';

class PieChartExample extends Component {

	static displayName = 'PieChart';

	constructor( props ) {
		super( props );

		const data = [
			{
				value: 189,
				name: props.translate( 'Direct' ),
				description:
					props.translate(
						'Customers who find your listing searching for your business or address'
					),
			},
			{
				value: 362,
				name: props.translate( 'Discovery' ),
				description:
					props.translate(
						'Customers who find your listing searching for a category, product, or service'
					),
			},
			{
				value: 122,
				name: props.translate( 'Referral' ),
				description: 
					props.translate(
						'Customers who find your listing by being referred from another type of search'
					),
			}
		];

		const dataTotal = data.reduce( (pv, cv) => pv + cv.value, 0 );

		this.state = {
			data,
			title: props.translate( '%(total)s Total Searches', {
				args: {
					total: dataTotal,
				}
			})
		};
	}

	render() {
		return (
			<PieChart
				data={ this.state.data }
				title={ this.state.title }
			/>
		);
	}
}

export default localize( PieChartExample ) ;
```

## Limits

Currently there are only 3 colors used in a pie chart. While there is no hard limit on exceeding this limit, it will make identifying the corresponding section difficult.

