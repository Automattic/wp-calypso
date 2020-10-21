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

const rewindStateImpliesVaultPress = ( rewindState?: { state?: string; reason?: string } ) => {
	if ( ! rewindState ) {
		return undefined;
	}

	// VaultPress sites always return a Rewind status of 'unavailable'
	if ( rewindState.state !== 'unavailable' ) {
		return false;
	}

	// These "reasons" for the unavailable state imply that
	// this site uses VaultPress instead of Rewind.
	const vaultPressReasons = [ 'vp_active_on_site', 'host_not_supported' ];

	return rewindState.reason && vaultPressReasons.includes( rewindState.reason );
};

const HasVaultPressSwitch: React.FC< Props > = ( {
	loadingComponent,
	trueComponent,
	falseComponent,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) );

	const isLoading = useCallback( () => ! rewindState || rewindState.state === 'uninitialized', [
		rewindState,
	] );
	const hasVaultPress = useCallback( () => rewindStateImpliesVaultPress( rewindState ), [
		rewindState,
	] );

	return (
		<RenderSwitch
			loadingCondition={ isLoading }
			renderCondition={ hasVaultPress }
			queryComponent={ <QueryRewindState siteId={ siteId } /> }
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

export default HasVaultPressSwitch;
