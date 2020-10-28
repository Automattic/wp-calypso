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
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

const productStateImpliesVaultPress = ( productState?: { code?: string; status?: number } ) => {
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
	// const rewindState = {
	// 		code: 'no_connected_jetpack',
	// 		status: 412,
	// 	};

	const hasJetpackConnectionFailed = useCallback(
		() => [ rewindState ].some( productStateImpliesVaultPress ),
		[ rewindState ]
	);

	const isLoading = useCallback( () => {
		if ( hasJetpackConnectionFailed() ) {
			return false;
		}

		return [ rewindState ].some( ( state ) => ! isInitialized( state ) );
	}, [ hasJetpackConnectionFailed, rewindState ] );

	return (
		<RenderSwitch
			loadingCondition={ isLoading }
			renderCondition={ hasJetpackConnectionFailed }
			queryComponent={
				<>
					<QueryRewindState siteId={ siteId } />
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
