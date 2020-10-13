/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

const HasVaultPressSwitch = ( { loadingComponent, trueComponent, falseComponent } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) );
	const hasVaultPress =
		rewindState?.state === 'unavailable' && rewindState?.reason === 'vp_active_on_site';

	return (
		<RenderSwitch
			loadingCondition={ () => ! rewindState || rewindState.state === 'uninitialized' }
			renderCondition={ () => hasVaultPress }
			queryComponent={ <QueryRewindState siteId={ siteId } /> }
			loadingComponent={ loadingComponent }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
		/>
	);
};

export default HasVaultPressSwitch;
