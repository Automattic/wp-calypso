import { useSite } from '@automattic/launch';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import PlansGrid from '@automattic/plans-grid';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import * as React from 'react';
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import { LAUNCH_STORE } from '../../stores';

import './styles.scss';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const { domain, LaunchStep, selectedPlanProductId } = useSelect( ( select ) => {
		const launchStore = select( LAUNCH_STORE );
		return {
			domain: launchStore.getSelectedDomain(),
			LaunchStep: launchStore.getLaunchStep(),
			selectedPlanProductId: launchStore.getSelectedPlanProductId(),
		};
	} );

	const { setPlanProductId, setStep } = useDispatch( LAUNCH_STORE );

	const { selectedFeatures } = useSite();

	const hasPaidDomain = domain && ! domain.is_free;

	const handleSelect = ( planProductId: number | undefined ) => {
		setPlanProductId( planProductId );
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
						{ sprintf(
							/* translators: number of days */
							__(
								'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within %1$d days.',
								'full-site-editing'
							),
							14
						) }
					</SubTitle>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<PlansGrid
					currentPlanProductId={ selectedPlanProductId }
					currentDomain={ domain }
					onPlanSelect={ handleSelect }
					onPickDomainClick={ handlePickDomain }
					disabledPlans={
						hasPaidDomain
							? {
									free: __( 'Unavailable with domain', 'full-site-editing' ),
							  }
							: undefined
					}
					isAccordion
					selectedFeatures={ selectedFeatures }
					locale={ window.wpcomEditorSiteLaunch?.locale || 'en' }
				/>
			</div>
			<div className="nux-launch-step__footer">
				<ActionButtons sticky={ true }>
					<BackButton onClick={ handlePrev } />
				</ActionButtons>
			</div>
		</LaunchStepContainer>
	);
};

export default PlanStep;
