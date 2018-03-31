/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PieChart from 'components/pie-chart';
import Card from 'components/card';

export default class extends Component {
	static displayName = 'PieChart';

	render() {
		return (
			<Card>
				<PieChart
					data={ [
						{
							value: 2,
							name: 'Series 1',
							description: 'The first series of data',
						},
						{
							value: 1,
							name: 'Series 2',
							description: 'The second series of data',
						},
						{
							value: 5,
							name: 'Series 3',
							description: 'The final series of data',
						},
					] }
					plural={ 'Data Points' }
				/>
			</Card>
		);
	}
}
