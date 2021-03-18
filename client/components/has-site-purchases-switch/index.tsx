/**
 * External dependencies
 */
import React, { ReactNode, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import {
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getSitePurchases,
} from 'calypso/state/purchases/selectors';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

type Props = {
	siteId: number;
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

const HasSitePurchasesSwitch: React.FC< Props > = ( {
	siteId,
	trueComponent,
	falseComponent,
	loadingComponent,
} ) => {
	const isFetching = useSelector( isFetchingSitePurchases );
	const hasLoaded = useSelector( hasLoadedSitePurchasesFromServer );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const loadingCondition = useCallback( () => ! hasLoaded || isFetching, [
		isFetching,
		hasLoaded,
	] );
	const renderCondition = useCallback( () => purchases.length > 0, [ purchases ] );

	return (
		<RenderSwitch
			queryComponent={ <QuerySitePurchases siteId={ siteId } /> }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
			loadingComponent={ loadingComponent }
			loadingCondition={ loadingCondition }
			renderCondition={ renderCondition }
		/>
	);
};

export default HasSitePurchasesSwitch;
