/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import PlansGrid from '@automattic/plans-grid';

import type { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';

interface Props {
	onSelect?: () => void;
}

const PlansGridFSE: React.FunctionComponent< Props > = ( { onSelect } ) => {
	const { domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { updatePlan } = useDispatch( LAUNCH_STORE );

	const handleSelect = ( planSlug: Plans.PlanSlug ) => {
		updatePlan( planSlug );
		onSelect?.();
	};

	return <PlansGrid currentDomain={ domain } onPlanSelect={ handleSelect } />;
};

export default PlansGridFSE;
