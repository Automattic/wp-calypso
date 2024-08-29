import { OnboardSelect } from '@automattic/data-stores';
import { useStepPersistedState } from '@automattic/onboarding';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { localize } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { PlansStep } from 'calypso/signup/steps/plans';
import { getIntervalType } from 'calypso/signup/steps/plans/util';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { ProvidedDependencies, StepProps } from '../../types';

export const LocalizedPlanStep = localize( PlansStep );

export default function PlansStepAdaptor( props: StepProps ) {
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();

	const { siteTitle, domainItem, domainItems } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			return {
				siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
				domainItem: select( ONBOARD_STORE ).getDomainCartItem(),
				domainItems: select( ONBOARD_STORE ).getDomainCartItems(),
			};
		},
		[]
	);
	const username = useSelector( getCurrentUserName );
	const coupon = undefined;

	const { setDomainCartItem, setDomainCartItems } = useWPDispatch( ONBOARD_STORE );

	const signupDependencies = {
		siteSlug,
		siteTitle,
		username,
		coupon,
		domainItem,
		domainCart: domainItems,
	};

	const site = useSite();
	const customerType = useQuery().get( 'customerType' );
	const dispatch = useDispatch();

	const [ planInterval, setPlanInterval ] = useState< string | undefined >( undefined );

	const onPlanIntervalUpdate = ( path: string ) => {
		const intervalType = getIntervalType( path );
		setPlanInterval( intervalType );
	};

	/**
	 * The plans step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
	 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
	 */
	let mostRecentState: ProvidedDependencies;

	return (
		<LocalizedPlanStep
			selectedSite={ site }
			saveSignupStep={ ( state: ProvidedDependencies ) => {
				setStepState( ( mostRecentState = { ...stepState, ...state } ) );
			} }
			submitSignupStep={ ( state: ProvidedDependencies ) => {
				/* The plans step removes paid domains when the user picks a free plan
				   after picking a paid domain */
				if ( state.stepName === 'domains' ) {
					setDomainCartItem( undefined );
					setDomainCartItems( undefined );
				} else {
					setStepState( ( mostRecentState = { ...stepState, ...state } ) );
					props.navigation.submit?.(
						( mostRecentState = { ...stepState, ...state, ...mostRecentState } )
					);
				}
			} }
			goToNextStep={ () => props.navigation.submit?.( { ...stepState, ...mostRecentState } ) }
			step={ stepState }
			customerType={ customerType }
			errorNotice={ ( message: string ) => dispatch( errorNotice( message ) ) }
			signupDependencies={ signupDependencies }
			stepName="plans"
			flowName={ props.flow }
			recordTracksEvent={ ( event: unknown ) => dispatch( recordTracksEvent( event ) ) }
			onPlanIntervalUpdate={ onPlanIntervalUpdate }
			intervalType={ planInterval }
			wrapperProps={ {
				goBack: props.navigation.goBack,
				recordTracksEvent: ( event: unknown ) => dispatch( recordTracksEvent( event ) ),
				isFullLayout: true,
				isExtraWideLayout: false,
			} }
			useStepperWrapper
		/>
	);
}
