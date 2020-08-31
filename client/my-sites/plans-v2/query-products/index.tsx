/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryProductsList from 'components/data/query-products-list';
import QuerySiteProducts from 'components/data/query-site-products';
import { getSelectedSiteId } from 'state/ui/selectors';

const QueryProducts: FunctionComponent< {} > = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	return <>{ siteId ? <QuerySiteProducts siteId={ siteId } /> : <QueryProductsList /> }</>;
};

export default QueryProducts;
