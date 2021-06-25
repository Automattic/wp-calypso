/**
 * External dependencies
 */
import React, { FC, ReactElement, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

const getCurrentUserCapabilities = ( state: AppState, siteId: number | null ) => {
	if ( ! siteId ) {
		return [];
	}

	return state.currentUser.capabilities[ siteId ];
};

const CurrentUserHasCapabilitiesSwitch: FC< Props > = ( {
	capabilities,
	trueComponent,
	falseComponent,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const userCapabilities = useSelector( ( state ) => getCurrentUserCapabilities( state, siteId ) );

	const hasCapabilities = useCallback(
		() => capabilities.every( ( p: string ) => userCapabilities[ p ] ),
		[ capabilities, userCapabilities ]
	);

	return (
		<RenderSwitch
			renderCondition={ hasCapabilities }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
		/>
	);
};

type Props = {
	capabilities: string[];
	trueComponent: ReactElement;
	falseComponent: ReactElement;
};

export default CurrentUserHasCapabilitiesSwitch;
