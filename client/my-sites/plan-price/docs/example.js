/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanPrice from '../';

function PlanPriceExample() {
	return (
		<div>
			<h3>Plan with standard price</h3>
			<PlanPrice rawPrice={ 99 } />

			<h3>Plan with discounted price</h3>
			<span style={ { display: 'flex' } }>
				<PlanPrice rawPrice={ 8.25 } original />
				<PlanPrice rawPrice={ 2.25 } discounted />
			</span>
		</div>
	);
}

PlanPriceExample.displayName = 'PlanPrice';

export default PlanPriceExample;

