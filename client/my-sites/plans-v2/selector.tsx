/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import PlansFilterBar from './plans-filter-bar';
import PlansColumn from './plans-column';
import ProductsColumn from './products-column';
import { SECURITY } from './constants';
import { TERM_ANNUALLY } from 'lib/plans/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';
import QuerySites from 'components/data/query-sites';

/**
 * Type dependencies
 */
import type { Duration, ProductType, SelectorPageProps } from './types';

import './style.scss';

const SelectorPage = ( { defaultDuration = TERM_ANNUALLY }: SelectorPageProps ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const [ productType, setProductType ] = useState< ProductType >( SECURITY );
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );

	return (
		<div>
			<PlansFilterBar
				onProductTypeChange={ setProductType }
				productType={ productType }
				onDurationChange={ setDuration }
				duration={ currentDuration }
			/>
			<div className="plans-v2__columns">
				<PlansColumn
					duration={ currentDuration }
					onPlanClick={ () => null }
					productType={ productType }
					siteId={ siteId }
				/>
				<ProductsColumn
					duration={ currentDuration }
					onProductClick={ () => null }
					productType={ productType }
					siteId={ siteId }
				/>
			</div>
			<QueryProductsList />
			{ siteId && <QuerySites siteId={ siteId } /> }
		</div>
	);
};

export default SelectorPage;
