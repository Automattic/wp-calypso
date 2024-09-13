import { OnboardSelect } from '@automattic/data-stores';
import { useStepPersistedState } from '@automattic/onboarding';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { localize } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
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
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { ProvidedDependencies, StepProps } from '../../types';

import './style.scss';

export const LocalizedPlanStep = localize( PlansStep );

export default function PlansStepAdaptor( props: StepProps ) {
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();
	const isMobile = useMobileBreakpoint();

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

	const { setDomainCartItem, setDomainCartItems, setSiteUrl } = useWPDispatch( ONBOARD_STORE );

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

	/**
	 * The plans step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
	 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
	 */
	let mostRecentState: ProvidedDependencies;

	const onPlanIntervalUpdate = ( path: string ) => {
		const intervalType = getIntervalType( path );
		setPlanInterval( intervalType );
	};

	const handleSubmitSignupStep = (
		step: Record< string, unknown >,
		providedDependencies: Record< string, unknown >,
		optionalProps: Record< string, unknown >
	) => {
		if ( step.stepName === 'domains' ) {
			if ( step.isPurchasingItem === false ) {
				setDomainCartItem( undefined );
				setDomainCartItems( undefined );
			} else if ( step.siteUrl ) {
				setSiteUrl( step.siteUrl );
			}
		} else {
			setStepState( ( mostRecentState = { ...stepState, ...step } ) );
			dispatch(
				submitSignupStep(
					mostRecentState,
					providedDependencies,
					optionalProps
				) as unknown as AnyAction
			);
			props.navigation.submit?.(
				( mostRecentState = { ...stepState, ...step, ...mostRecentState } )
			);
		}
	};

	return (
		<LocalizedPlanStep
			selectedSite={ site }
			saveSignupStep={ ( state: ProvidedDependencies ) => {
				setStepState( ( mostRecentState = { ...stepState, ...state } ) );
			} }
			submitSignupStep={ handleSubmitSignupStep }
			goToNextStep={ () => props.navigation.submit?.( { ...stepState, ...mostRecentState } ) }
			step={ stepState }
			customerType={ customerType }
			errorNotice={ ( message: string ) => dispatch( errorNotice( message ) ) }
			signupDependencies={ signupDependencies }
			stepName="plans"
			flowName={ props.flow }
			recordTracksEvent={ ( name: string, props: unknown ) => {
				dispatch( recordTracksEvent( name, props ) );
			} }
			onPlanIntervalUpdate={ onPlanIntervalUpdate }
			intervalType={ planInterval }
			wrapperProps={ {
				hideBack: isMobile,
				goBack: props.navigation.goBack,
				recordTracksEvent: ( name: string, props: unknown ) =>
					dispatch( recordTracksEvent( name, props ) ),
				isFullLayout: true,
				isExtraWideLayout: false,
			} }
			useStepperWrapper
		/>
	);
}
