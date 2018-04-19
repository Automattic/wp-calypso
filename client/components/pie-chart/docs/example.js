/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';

const titleFunc = ( translate, dataTotal ) => {
	return translate( '%(dataTotal)d Total Searches', {
		args: {
			dataTotal,
		},
	} );
};

class PieChartExample extends Component {
	static displayName = 'PieChart';

	constructor( props ) {
		super( props );

		const data = [
			{
				value: 189,
				name: 'Direct',
				description: 'Customers who find your listing searching for your business or address',
			},
			{
				value: 362,
				name: 'Discovery',
				description:
					'Customers who find your listing searching for a category, product, or service',
			},
			{
				value: 122,
				name: 'Referral',
				description:
					'Customers who find your listing by being referred from another type of search',
			},
		];

		this.state = {
			data,
		};
	}

	render() {
		return (
			<Card>
				<PieChart data={ this.state.data } title={ titleFunc } />
				<PieChartLegend data={ this.state.data } />
			</Card>
		);
	}
}

export default PieChartExample;
