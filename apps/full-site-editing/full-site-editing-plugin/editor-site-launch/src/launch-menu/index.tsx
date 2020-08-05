/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

import { LAUNCH_STORE } from '../stores';
import { LaunchStep, LaunchSequence } from '../../../common/data-stores/launch/data';
import LaunchMenuItem from './item';
import './styles.scss';

const LaunchStepMenuItemTitles = {
	[ LaunchStep.Name ]: __( 'Name your site', 'full-site-editing' ),
	[ LaunchStep.Domain ]: __( 'Choose a domain', 'full-site-editing' ),
	[ LaunchStep.Plan ]: __( 'Choose a plan', 'full-site-editing' ),
	[ LaunchStep.Final ]: __( 'Launch your site', 'full-site-editing' ),
};

const LaunchMenu = () => {
	const { step: currentStep, completedSteps } = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getState()
	);

	const { setStep } = useDispatch( LAUNCH_STORE );

	return (
		<div className="nux-launch-menu">
			<h4>{ __( 'Site Launch Steps', 'full-site-editing' ) }</h4>
			<div className="nux-launch-menu__item-group">
				{ LaunchSequence.map( ( step ) => (
					<LaunchMenuItem
						title={ LaunchStepMenuItemTitles[ step ] }
						isCompleted={ completedSteps.includes( step ) }
						isCurrent={ step === currentStep }
						onClick={ () => setStep( step ) }
					/>
				) ) }
			</div>
		</div>
	);
};

export default LaunchMenu;
