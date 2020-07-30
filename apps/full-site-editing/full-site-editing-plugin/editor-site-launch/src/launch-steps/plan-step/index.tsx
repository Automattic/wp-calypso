/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../../stores';
import { LaunchStep } from '../../../../common/data-stores/launch/data';
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import PlansGridFSE from '../../../../editor-plans-grid/src/plans-grid-fse';
import './styles.scss';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const { setStepComplete } = useDispatch( LAUNCH_STORE );

	const handleBack = () => {
		onPrevStep?.();
	};

	const handleSelect = () => {
		setStepComplete( LaunchStep.Plan );
		onNextStep?.();
	};

	return (
		<LaunchStepContainer className="nux-launch-plan-step">
			<div className="nux-launch-step__header">
				<div>
					<Title>{ __( 'Select a plan', 'full-site-editing' ) }</Title>
					<SubTitle>
						{ __(
							'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.',
							'full-site-editing'
						) }
					</SubTitle>
				</div>
				<ActionButtons>
					<BackButton onClick={ handleBack } />
				</ActionButtons>
			</div>
			<div className="nux-launch-step__body">
				<PlansGridFSE onSelect={ handleSelect } />
			</div>
		</LaunchStepContainer>
	);
};

export default PlanStep;
