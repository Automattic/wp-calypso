/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import ProductsColumn from './products-column';
import PlansFilterBar from './plans-filter-bar';
import type { Duration, ProductType, SelectorPageProps } from './types';
import { SECURITY } from './constants';
import { TERM_ANNUALLY } from 'lib/plans/constants';
import QueryProductsList from 'components/data/query-products-list';

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
			<ProductsColumn
				duration={ currentDuration }
				onProductClick={ () => null }
				productType={ productType }
			/>
			<QueryProductsList />
		</div>
	);
};

export default SelectorPage;
