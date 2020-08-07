/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import PlansGrid from '@automattic/plans-grid';
import { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';

interface Props {
	onSelect?: () => void;
}

const PlansGridFSE: React.FunctionComponent< Props > = ( { onSelect } ) => {
	const { domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );

	const { updatePlan, setStep } = useDispatch( LAUNCH_STORE );

	const handleSelect = ( planSlug: Plans.PlanSlug ) => {
		updatePlan( planSlug );
		onSelect?.();
	};

	const handlePickDomain = () => {
		setStep( LaunchStep.Domain );
	};

	return (
		<PlansGrid
			currentDomain={ domain }
			onPlanSelect={ handleSelect }
			onPickDomainClick={ handlePickDomain }
			disabledPlans={
				domain && ! domain.is_free
					? {
							[ Plans.PLAN_FREE ]: __( 'Not available with custom domain', 'full-site-editing' ),
					  }
					: undefined
			}
		/>
	);
};

export default PlansGridFSE;
