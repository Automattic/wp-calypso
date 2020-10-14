/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Plans } from '@automattic/data-stores';
import PlansGrid from '@automattic/plans-grid';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import { LAUNCH_STORE } from '../../stores';
import { useSite } from '../../hooks';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );
	const { isExperimental } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const { updatePlan, setStep } = useDispatch( LAUNCH_STORE );

	const { selectedFeatures } = useSite();

	const hasPaidDomain = domain && ! domain.is_free;

	const handleSelect = ( planSlug: Plans.PlanSlug ) => {
		updatePlan( planSlug );
		onNextStep?.();
	};

	const handlePrev = () => {
		onPrevStep?.();
	};

	const handlePickDomain = () => {
		setStep( LaunchStep.Domain );
	};

	return (
		<LaunchStepContainer>
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
				<ActionButtons stickyBreakpoint="medium">
					<BackButton onClick={ handlePrev } />
				</ActionButtons>
			</div>
			<div className="nux-launch-step__body">
				<PlansGrid
					currentDomain={ domain }
					onPlanSelect={ handleSelect }
					onPickDomainClick={ handlePickDomain }
					disabledPlans={
						hasPaidDomain
							? {
									[ Plans.PLAN_FREE ]: __(
										'Not available with custom domain',
										'full-site-editing'
									),
							  }
							: undefined
					}
					isExperimental={ isExperimental }
					selectedFeatures={ selectedFeatures }
				/>
			</div>
		</LaunchStepContainer>
	);
};

export default PlanStep;
