/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import PlansGrid from '@automattic/plans-grid';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import { useLocale } from '@automattic/i18n-utils';
import type { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { PLANS_STORE } from '../../stores/plans';
import { Step, usePath } from '../../path';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';

interface Props {
	isModal?: boolean;
}

const PlansStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __ } = useI18n();
	const locale = useLocale();
	const history = useHistory();
	const makePath = usePath();
	const { goBack, goNext } = useStepNavigation();

	const [ billingPeriod, setBillingPeriod ] = React.useState< Plans.PlanBillingPeriod >();

	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );
	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );
	const isPlanProductFree = useSelect( ( select ) => select( PLANS_STORE ).isPlanProductFree );
	const selectedPlanProductId = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getPlanProductId()
	);
	const selectedPlanProduct = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanProductById( selectedPlanProductId )
	);

	const { setDomain, updatePlan, setHasUsedPlansStep } = useDispatch( ONBOARD_STORE );
	React.useEffect( () => {
		! isModal && setHasUsedPlansStep( true );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();
	React.useEffect( () => {
		selectedPlanRef.current = selectedPlanProduct?.storeSlug;
	}, [ selectedPlanProduct ] );

	useTrackStep( isModal ? 'PlansModal' : 'Plans', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	const [ planUpdated, setPlanUpdated ] = React.useState( false );

	const handleBack = () => ( isModal ? history.goBack() : goBack() );
	const handlePlanSelect = async ( planProductId: number | undefined ) => {
		// When picking a free plan, if there is a paid domain selected, it's changed automatically to a free domain
		if ( isPlanProductFree( planProductId ) && ! domain?.is_free ) {
			setDomain( freeDomainSuggestion );
		}

		await updatePlan( planProductId as number );

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
					{ sprintf(
						/* translators: number of days */
						__(
							'Pick a plan that’s right for you. There’s no risk, you can cancel for a full refund within %1$d days.'
						),
						// Only show a 7-days refund window if billing period is
						// defined AND is set to monthl (its value starts as undefined)
						billingPeriod === 'MONTHLY' ? 7 : 14
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
				currentPlanProductId={ selectedPlanProductId }
				onPickDomainClick={ handlePickDomain }
				isAccordion
				selectedFeatures={ selectedFeatures }
				locale={ locale }
				onBillingPeriodChange={ setBillingPeriod }
			/>
		</div>
	);
};

export default PlansStep;
