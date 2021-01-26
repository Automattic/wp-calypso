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
import type { LaunchStepType } from '../../../common/data-stores/launch';

import './styles.scss';

interface Props {
	onMenuItemClick: ( step: LaunchStepType ) => void;
}

const LaunchMenu: React.FunctionComponent< Props > = ( { onMenuItemClick } ) => {
	const { __ } = useI18n();

	const { currentStep, LaunchStep, LaunchSequence, isStepCompleted, isFlowCompleted } = useSelect(
		( select ) => {
			const launchStore = select( LAUNCH_STORE );
			return {
				currentStep: launchStore.getCurrentStep(),
				LaunchStep: launchStore.getLaunchStep(),
				LaunchSequence: launchStore.getLaunchSequence(),
				isStepCompleted: launchStore.isStepCompleted,
				isFlowCompleted: launchStore.isFlowCompleted(),
			};
		}
	);

	const LaunchStepMenuItemTitles = {
		[ LaunchStep.Name ]: __( 'Name your site', 'full-site-editing' ),
		[ LaunchStep.Domain ]: __( 'Select a domain', 'full-site-editing' ),
		[ LaunchStep.Plan ]: __( 'Select a plan', 'full-site-editing' ),
		[ LaunchStep.Final ]: __( 'Launch your site', 'full-site-editing' ),
	};

	const { setStep } = useDispatch( LAUNCH_STORE );

	const handleClick = ( step: string ) => {
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
						isDisabled={ step === LaunchStep.Final && ! isFlowCompleted }
					/>
				) ) }
			</div>
		</div>
	);
};

export default LaunchMenu;
