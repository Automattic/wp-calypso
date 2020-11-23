/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import LaunchMenuItem from './item';
import type { LaunchStepType } from '../../../common/data-stores/launch/types';

import './styles.scss';

interface Props {
	onMenuItemClick: ( step: LaunchStepType ) => void;
}

const LaunchMenu: React.FunctionComponent< Props > = ( { onMenuItemClick } ) => {
	const { __ } = useI18n();
	const { step: currentStep } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );
	const LaunchSequence = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchSequence() );
	const isStepCompleted = useSelect( ( select ) => select( LAUNCH_STORE ).isStepCompleted );
	const isFlowStarted = useSelect( ( select ) => select( LAUNCH_STORE ).isFlowStarted() );

	const LaunchStepMenuItemTitles = {
		[ LaunchStep.Name ]: __( 'Name your site', 'full-site-editing' ),
		[ LaunchStep.Domain ]: __( 'Select a domain', 'full-site-editing' ),
		[ LaunchStep.Plan ]: __( 'Select a plan', 'full-site-editing' ),
		[ LaunchStep.Final ]: __( 'Launch your site', 'full-site-editing' ),
	};

	const { setStep } = useDispatch( LAUNCH_STORE );

	const handleClick = ( step ) => {
		setStep( step );
		onMenuItemClick( step );
	};

	return (
		<div className="nux-launch-menu">
			<h4>{ __( 'Site Launch Steps', 'full-site-editing' ) }</h4>
			<div className="nux-launch-menu__item-group">
				{ LaunchSequence.map( ( step ) => (
					<LaunchMenuItem
						key={ step }
						title={ LaunchStepMenuItemTitles[ step ] }
						isCompleted={ isStepCompleted( step ) }
						isCurrent={ step === currentStep }
						onClick={ () => handleClick( step ) }
						isDisabled={ step === LaunchStep.Final && ! isFlowStarted }
					/>
				) ) }
			</div>
		</div>
	);
};

export default LaunchMenu;
