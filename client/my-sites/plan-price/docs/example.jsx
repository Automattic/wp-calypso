/** @format */

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
			<PlanPrice rawPriceRange={ [ 99, 140 ] } />
			<br />
			<h3>Plan with discounted price</h3>
			<span style={ { display: 'flex' } }>
				<PlanPrice rawPrice={ 8.25 } original />
				<PlanPrice rawPrice={ 2.25 } discounted />
				<PlanPrice rawPriceRange={ [ 8.25, 20.23 ] } original />
				<PlanPrice rawPriceRange={ [ 2.25, 3.5 ] } discounted />
			</span>
			<br />
			<h3>Plan with discounted price and tax</h3>
			<span style={ { display: 'flex' } }>
				<PlanPrice rawPrice={ 8.25 } original taxText="10%" />
				<PlanPrice rawPrice={ 2.25 } discounted taxText="10%" />
				<PlanPrice rawPriceRange={ [ 8.25, 20.23 ] } original taxText="10%" />
				<PlanPrice rawPriceRange={ [ 2.25, 3.5 ] } discounted taxText="10%" />
			</span>
			<br />
			<h3>Simple View (isInSignup) - Plan with discounted price and tax </h3>
			<span style={ { display: 'flex' } }>
				<PlanPrice rawPrice={ 8.25 } original taxText="10%" isInSignup={ true } />
				<PlanPrice rawPrice={ 2.25 } discounted taxText="10%" isInSignup={ true } />
				<PlanPrice rawPriceRange={ [ 8.25, 20.23 ] } original taxText="10%" isInSignup={ true } />
				<PlanPrice rawPriceRange={ [ 2.25, 3.5 ] } discounted taxText="10%" isInSignup={ true } />
			</span>
		</div>
	);
}

PlanPriceExample.displayName = 'PlanPrice';

export default PlanPriceExample;
