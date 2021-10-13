import { ReactNode, useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { resetSiteState } from 'calypso/state/purchases/actions';
import {
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getSitePurchases,
} from 'calypso/state/purchases/selectors';

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
	const dispatch = useDispatch();
	const [ currentSiteId, setCurrentSiteId ] = useState( siteId );
	const isFetching = useSelector( isFetchingSitePurchases );
	const hasLoaded = useSelector( hasLoadedSitePurchasesFromServer );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const loadingCondition = useCallback( () => ! hasLoaded || isFetching, [
		hasLoaded,
		isFetching,
	] );
	const renderCondition = useCallback( () => purchases.length > 0, [ purchases ] );

	useEffect( () => {
		if ( siteId !== currentSiteId ) {
			setCurrentSiteId( siteId );
			dispatch( resetSiteState() );
		}
	}, [ siteId, currentSiteId, setCurrentSiteId, dispatch ] );

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
