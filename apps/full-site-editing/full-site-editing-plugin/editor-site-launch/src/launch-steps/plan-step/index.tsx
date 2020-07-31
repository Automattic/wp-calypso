/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchStep, { Props as LaunchStepProps } from '../../launch-step';
import PlansGridFSE from '../../../../editor-plans-grid/src/plans-grid-fse';
import './styles.scss';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const handleBack = () => {
		onPrevStep?.();
	};

	return (
		<LaunchStep className="nux-launch-plan-step">
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
				<ActionButtons>
					<BackButton onClick={ handleBack } />
				</ActionButtons>
			</div>
			<div className="nux-launch-step__body">
				<PlansGridFSE onSelect={ onNextStep } />
			</div>
		</LaunchStep>
	);
};

export default PlanStep;
