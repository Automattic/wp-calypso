/**
 * External dependencies
 */
import React, { ReactNode, useCallback, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getSiteCredentialsRequestStatus from 'calypso/state/selectors/get-site-credentials-request-status';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';

type Props = {
	siteId: number;
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

const HasSiteCredentialsSwitch: React.FC< Props > = ( {
	siteId,
	trueComponent,
	falseComponent,
	loadingComponent,
} ) => {
	const siteStatus = useSelector( ( state ) => getSiteCredentialsRequestStatus( state, siteId ) );
	const credentials = useSelector( ( state ) => getJetpackCredentials( state, siteId, 'main' ) );
	const isFetching = useSelector( ( state ) => isRequestingSiteCredentials( state, siteId ) );
	const hasLoaded = siteStatus === 'success';
	const hasCredentials = Object.keys( credentials ).length > 0;

	const [ isLocked, setLocked ] = useState( hasCredentials );
	const [ currentSiteId, setCurrentSiteId ] = useState( siteId );

	const loadingCondition = useCallback( () => ( ! hasLoaded || isFetching ) && ! isLocked, [
		hasLoaded,
		isFetching,
		isLocked,
	] );
	const renderCondition = useCallback( () => hasCredentials, [ hasCredentials ] );

	useEffect( () => {
		if ( hasLoaded ) {
			setLocked( true );
		}
	}, [ hasLoaded, setLocked ] );

	useEffect( () => {
		if ( siteId !== currentSiteId ) {
			setCurrentSiteId( siteId );
			setLocked( false );
		}
	}, [ siteId, currentSiteId, setCurrentSiteId ] );

	return (
		<RenderSwitch
			queryComponent={ <QuerySiteCredentials siteId={ siteId } /> }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
			loadingComponent={ loadingComponent }
			loadingCondition={ loadingCondition }
			renderCondition={ renderCondition }
		/>
	);
};

export default HasSiteCredentialsSwitch;
