/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PieChart from 'components/pie-chart';
import Card from 'components/card';

export default class extends React.Component {
	static displayName = 'PieChart';

	render() {
		return (
			<Card>
				<PieChart
					data={ [
						{
							value: 2,
							name: 'Series 1',
						},
						{
							value: 1,
							name: 'Series 2',
						},
						{
							value: 5,
							name: 'Series 3',
						},
					] }
					radius={ 200 }
				/>
			</Card>
		);
	}
}
