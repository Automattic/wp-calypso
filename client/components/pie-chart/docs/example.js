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

const PieChartExample = () => {
	return (
		<Card>
			<PieChart
				data={ [
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
						description: 'Customers who find your listing by being referred from another type of search',

					}
				] }
				title={ 'Total Searches' }
			/>
		</Card>
	);
}

PieChartExample.displayName = 'PieChart';

export default PieChartExample;
