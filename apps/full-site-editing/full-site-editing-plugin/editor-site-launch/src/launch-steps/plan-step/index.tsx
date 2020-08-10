/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import PlansGridFSE from '../../../../editor-plans-grid/src/plans-grid-fse';
import { LAUNCH_STORE } from '../../stores';

import './styles.scss';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );
	const { setStepComplete } = useDispatch( LAUNCH_STORE );

	const handleNext = () => {
		setStepComplete( LaunchStep.Plan );
		onNextStep?.();
	};

	return (
		<LaunchStepContainer className="nux-launch-plan-step">
			<div className="nux-launch-step__header">
				<div>
					<Title>{ __( 'Choose a plan', 'full-site-editing' ) }</Title>
					<SubTitle>
						{ __(
							'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.',
							'full-site-editing'
						) }
					</SubTitle>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<PlansGridFSE onSelect={ handleNext } />
			</div>
		</LaunchStepContainer>
	);
};

export default PlanStep;
