import { OnboardSelect } from '@automattic/data-stores';
import { useStepPersistedState } from '@automattic/onboarding';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { ProvidedDependencies, StepProps } from '../../types';
import UnifiedPlansStep from './unified-plans-step';
import { getIntervalType } from './util';

import './style.scss';

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
	const coupon = useQuery().get( 'coupon' ) ?? undefined;

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
	const customerType = useQuery().get( 'customerType' ) ?? undefined;
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

	return (
		<UnifiedPlansStep
			selectedSite={ site ?? undefined }
			saveSignupStep={ ( step ) => {
				setStepState( ( mostRecentState = { ...stepState, ...step } ) );
			} }
			submitSignupStep={ ( stepInfo ) => {
				/* The plans step removes paid domains when the user picks a free plan
				   after picking a paid domain */
				if ( stepInfo.stepName === 'domains' ) {
					if ( stepInfo.isPurchasingItem === false ) {
						setDomainCartItem( undefined );
						setDomainCartItems( undefined );
					} else if ( stepInfo.siteUrl ) {
						setSiteUrl( stepInfo.siteUrl );
					}
				} else {
					setStepState( ( mostRecentState = { ...stepState, ...stepInfo } ) );
				}
			} }
			goToNextStep={ () => {
				props.navigation.submit?.( { ...stepState, ...mostRecentState } );
			} }
			step={ stepState }
			customerType={ customerType }
			signupDependencies={ signupDependencies }
			stepName="plans"
			flowName={ props.flow }
			onPlanIntervalUpdate={ onPlanIntervalUpdate }
			intervalType={ planInterval }
			wrapperProps={ {
				hideBack: isMobile,
				goBack: props.navigation.goBack,
				isFullLayout: true,
				isExtraWideLayout: false,
			} }
			useStepperWrapper
		/>
	);
}
