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

function PieChartExample() {
	return (
		<Card>
			<PieChart
				data={ [
					{
						value: 362,
						name: 'Direct',
						description: 'Customers who find your listing searching for your business or address',
					},
					{
						value: 189,
						name: 'Discovery',
						description:
							'Customers who find your listing searching for a category, product, or service',
					},
				] }
				plural={ 'Total Searches' }
			/>
		</Card>
	);
}

PieChartExample.displayName = 'PieChart';

export default PieChartExample;
