/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Plans } from '@automattic/data-stores';
import PlansGrid from '@automattic/plans-grid';
import { Title, SubTitle } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import { LAUNCH_STORE } from '../../stores';
import './styles.scss';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );
	const { isExperimental } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const { updatePlan, setStep } = useDispatch( LAUNCH_STORE );

	const handleSelect = ( planSlug: Plans.PlanSlug ) => {
		updatePlan( planSlug );
		onNextStep?.();
	};

	const handlePickDomain = () => {
		setStep( LaunchStep.Domain );
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
				<PlansGrid
					currentDomain={ domain }
					onPlanSelect={ handleSelect }
					onPickDomainClick={ handlePickDomain }
					disabledPlans={
						domain && ! domain.is_free
							? {
									[ Plans.PLAN_FREE ]: __(
										'Not available with custom domain',
										'full-site-editing'
									),
							  }
							: undefined
					}
					isExperimental={ isExperimental }
				/>
			</div>
		</LaunchStepContainer>
	);
};

export default PlanStep;
