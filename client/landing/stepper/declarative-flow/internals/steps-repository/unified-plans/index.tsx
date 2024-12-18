import {
	ActiveTheme,
	OnboardSelect,
	updateLaunchpadSettings,
	useStarterDesignBySlug,
} from '@automattic/data-stores';
import { isOnboardingFlow, useStepPersistedState } from '@automattic/onboarding';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useDispatch, useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSelector, useDispatch as useReduxDispatch } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { useGoalsFirstExperiment } from '../../../helpers/use-goals-first-experiment';
import { ProvidedDependencies, StepProps } from '../../types';
import UnifiedPlansStep from './unified-plans-step';
import { getIntervalType } from './util';

import './style.scss';

export default function PlansStepAdaptor( props: StepProps ) {
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();
	const isMobile = useMobileBreakpoint();
	const { siteTitle, domainItem, domainItems, selectedDesign } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			return {
				siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
				domainItem: select( ONBOARD_STORE ).getDomainCartItem(),
				domainItems: select( ONBOARD_STORE ).getDomainCartItems(),
				selectedDesign: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			};
		},
		[]
	);
	const username = useSelector( getCurrentUserName );
	const coupon = useQuery().get( 'coupon' ) ?? undefined;
	const { data: defaultDesign } = useStarterDesignBySlug( 'twentytwentyfour' );
	const [ , isGoalFirstExperiment ] = useGoalsFirstExperiment();
	const { setDomainCartItem, setDomainCartItems, setSiteUrl, setSelectedDesign, setPendingAction } =
		useWPDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const reduxDispatch = useReduxDispatch();

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

	/**
	 *  Plan step switches the selected theme to default twentytwentyfour when the plan is free
	 *  but the selected design requires a paid plan.
	 */
	const switchPaidDesignToDefault = ( stepInfo: ProvidedDependencies ) => {
		const hasPaidDesign =
			( selectedDesign?.design_tier && selectedDesign?.design_tier !== 'free' ) || false;
		const isOnboarding = isOnboardingFlow( props.flow ) && isGoalFirstExperiment;

		if ( ! hasPaidDesign || !! stepInfo.cartItems || ! isOnboarding ) {
			return;
		}

		if ( site ) {
			updateLaunchpadSettings( site?.ID || '', {
				checklist_statuses: { design_completed: false },
			} );

			setPendingAction( () => {
				return setDesignOnSite( site?.ID, defaultDesign, {
					styleVariation: defaultDesign?.style_variations?.[ 0 ],
				} ).then( ( theme: ActiveTheme ) => {
					return reduxDispatch( setActiveTheme( site?.ID || -1, theme ) );
				} );
			} );
		}

		setSelectedDesign( defaultDesign );
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
				switchPaidDesignToDefault( mostRecentState );
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
