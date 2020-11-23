/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import PlansGrid from '@automattic/plans-grid';
import type { Plans } from '@automattic/data-stores';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { PLANS_STORE } from '../../stores/plans';
import { Step, usePath } from '../../path';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';

type PlanSlug = Plans.PlanSlug;

interface Props {
	isModal?: boolean;
}

const PlansStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __ } = useI18n();
	const locale = useLocale();
	const history = useHistory();
	const makePath = usePath();
	const { goBack, goNext } = useStepNavigation();

	const plan = useSelectedPlan();
	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );
	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );
	const isPlanFree = useSelect( ( select ) => select( PLANS_STORE ).isPlanFree );

	const { setDomain, updatePlan, setHasUsedPlansStep } = useDispatch( ONBOARD_STORE );
	React.useEffect( () => {
		! isModal && setHasUsedPlansStep( true );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();
	React.useEffect( () => {
		selectedPlanRef.current = plan?.storeSlug;
	}, [ plan ] );

	useTrackStep( isModal ? 'PlansModal' : 'Plans', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	const [ planUpdated, setPlanUpdated ] = React.useState( false );

	const handleBack = () => ( isModal ? history.goBack() : goBack() );
	const handlePlanSelect = async ( planSlug: PlanSlug ) => {
		// When picking a free plan, if there is a paid domain selected, it's changed automatically to a free domain
		if ( isPlanFree( planSlug ) && ! domain?.is_free ) {
			setDomain( freeDomainSuggestion );
		}

		await updatePlan( planSlug );

		// We need all hooks to have updated before calling the `goNext()` function,
		// so we defer by setting a flag and waiting for it to update.
		setPlanUpdated( true );
	};
	const handlePickDomain = () => history.push( makePath( Step.DomainsModal ) );

	React.useEffect( () => {
		if ( planUpdated ) {
			if ( isModal ) {
				history.goBack();
			} else {
				goNext();
			}

			setPlanUpdated( false );
		}
	}, [ goNext, history, isModal, planUpdated ] );

	const header = (
		<>
			<div>
				<Title>{ __( 'Select a plan' ) }</Title>
				<SubTitle>
					{ __(
						'Pick a plan that’s right for you. There’s no risk, you can cancel for a full refund within 30 days.'
					) }
				</SubTitle>
			</div>
			<ActionButtons>
				<BackButton onClick={ handleBack } />
			</ActionButtons>
		</>
	);

	return (
		<div className="gutenboarding-page plans">
			<PlansGrid
				header={ header }
				currentDomain={ domain }
				onPlanSelect={ handlePlanSelect }
				onPickDomainClick={ handlePickDomain }
				isAccordion
				selectedFeatures={ selectedFeatures }
				locale={ locale }
			/>
		</div>
	);
};

export default PlansStep;
