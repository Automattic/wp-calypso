/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const QueryProducts: FunctionComponent< {} > = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	return <>{ siteId ? <QuerySiteProducts siteId={ siteId } /> : <QueryProductsList /> }</>;
};

export default QueryProducts;
