/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import PlansFilterBar from './plans-filter-bar';
import type { Duration, ProductType, SelectorPageProps } from './types';
import { TERM_ANNUALLY } from 'lib/plans/constants';
import { SECURITY } from './constants';

const SelectorPage = ( { defaultDuration = TERM_ANNUALLY }: SelectorPageProps ) => {
	const [ productType, setProductType ] = useState< ProductType >( SECURITY );
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );
	const currentDurationString = currentDuration === TERM_ANNUALLY ? 'annual' : 'monthly';

	return (
		<div>
			<PlansFilterBar
				onProductTypeChange={ setProductType }
				productType={ productType }
				onDurationChange={ setDuration }
				duration={ currentDuration }
			/>
			<h1>Hello this is the Selector Page!</h1>
			<p>{ `You are currently looking at ${ currentDurationString } products of type ${ productType }` }</p>
		</div>
	);
};

export default SelectorPage;
