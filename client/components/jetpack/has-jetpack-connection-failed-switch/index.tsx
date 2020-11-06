/**
 * External dependencies
 */
import React, { ReactElement, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

const stateImpliesJetpackIsDisconnected = ( productState?: {
	state?: string;
	reason?: string;
} ) => {
	if ( ! productState ) {
		return undefined;
	}

	return productState.code === 'no_connected_jetpack' && productState.status === 412;
};

const isInitialized = ( productState: { state?: string } | null ) =>
	productState && productState.state !== 'uninitialized';

const HasJetpackConnectionFailedSwitch: React.FC< Props > = ( {
	loadingComponent,
	trueComponent,
	falseComponent,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) );
	const scanState = useSelector( ( state ) => getSiteScanState( state, siteId ) );

	const isJetpackDisconnected = useCallback(
		() => [ rewindState, scanState ].some( stateImpliesJetpackIsDisconnected ),
		[ rewindState, scanState ]
	);

	const isLoading = useCallback( () => {
		if ( isJetpackDisconnected() ) {
			return false;
		}

		return [ rewindState, scanState ].some( ( state ) => ! isInitialized( state ) );
	}, [ isJetpackDisconnected, rewindState, scanState ] );

	return (
		<RenderSwitch
			loadingCondition={ isLoading }
			renderCondition={ isJetpackDisconnected }
			queryComponent={
				<>
					<QueryRewindState siteId={ siteId } />
					<QueryJetpackScan siteId={ siteId } />
				</>
			}
			loadingComponent={ loadingComponent }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
		/>
	);
};

type Props = {
	loadingComponent?: ReactElement;
	trueComponent?: ReactElement;
	falseComponent?: ReactElement;
};

export default HasJetpackConnectionFailedSwitch;
