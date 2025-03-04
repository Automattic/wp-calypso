import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	ActiveTheme,
	OnboardSelect,
	updateLaunchpadSettings,
	useStarterDesignBySlug,
} from '@automattic/data-stores';
import {
	EXAMPLE_FLOW,
	isOnboardingFlow,
	NEW_HOSTED_SITE_FLOW,
	NEWSLETTER_FLOW,
	START_WRITING_FLOW,
	useStepPersistedState,
} from '@automattic/onboarding';
import { useDispatch, useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useState } from 'react';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import Loading from 'calypso/components/loading';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	getHidePlanPropsBasedOnCreateWithBigSky,
	getHidePlanPropsBasedOnThemeType,
} from 'calypso/my-sites/plans-features-main/components/utils/utils';
import { getSignupCompleteSiteID, getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { useSelector, useDispatch as useReduxDispatch } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { getTheme, getThemeType } from 'calypso/state/themes/selectors';
import { useGoalsFirstExperiment } from '../../../helpers/use-goals-first-experiment';
import UnifiedPlansStep from './unified-plans-step';
import { getIntervalType } from './util';
import type { ProvidedDependencies, StepProps } from '../../types';
import type { PlansIntent } from '@automattic/plans-grid-next';

import './style.scss';

/**
 * Copied from steps-repository/plans (which should be removed)
 */
function getPlansIntent( flowName: string | null, isWordCampPromo?: boolean ): PlansIntent | null {
	switch ( flowName ) {
		case START_WRITING_FLOW:
			return 'plans-blog-onboarding';
		case NEWSLETTER_FLOW:
		case EXAMPLE_FLOW:
			return 'plans-newsletter';
		case NEW_HOSTED_SITE_FLOW:
			if ( isWordCampPromo ) {
				return 'plans-new-hosted-site-business-only';
			}
			return 'plans-new-hosted-site';
		default:
			return null;
	}
}

export default function PlansStepAdaptor( props: StepProps ) {
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();

	const { siteTitle, domainItem, domainItems, selectedDesign, createWithBigSky } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			const {
				getSelectedSiteTitle,
				getDomainCartItem,
				getDomainCartItems,
				getSelectedDesign,
				getCreateWithBigSky,
			} = select( ONBOARD_STORE );
			return {
				siteTitle: getSelectedSiteTitle(),
				domainItem: getDomainCartItem(),
				domainItems: getDomainCartItems(),
				selectedDesign: getSelectedDesign(),
				createWithBigSky: getCreateWithBigSky(),
			};
		},
		[]
	);
	const username = useSelector( getCurrentUserName );
	const coupon = useQuery().get( 'coupon' ) ?? undefined;
	const { data: defaultDesign } = useStarterDesignBySlug( 'twentytwentyfour' );
	const [ , isGoalFirstExperiment ] = useGoalsFirstExperiment();
	const { setSiteUrl, setSelectedDesign, setPendingAction } = useWPDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const reduxDispatch = useReduxDispatch();

	const theme = useSelector( ( state ) =>
		selectedDesign ? getTheme( state, 'wpcom', selectedDesign.slug ) : null
	);
	const selectedThemeType = useSelector( ( state ) =>
		theme ? getThemeType( state, theme.id ) : ''
	);
	const isLoadingSelectedTheme = selectedDesign && ! theme;
	const { siteUrl } = useSelect(
		( select ) => ( {
			siteUrl: ( select( ONBOARD_STORE ) as OnboardSelect ).getSiteUrl(),
		} ),
		[]
	);

	const signupDependencies = {
		siteSlug,
		siteTitle,
		username,
		coupon,
		domainItem,
		domainCart: domainItems,
		selectedThemeType,
		siteUrl,
	};

	const postSignUpSiteSlugParam = getSignupCompleteSlug();
	const postSignUpSiteIdParam = getSignupCompleteSiteID();

	const site = useSite( postSignUpSiteSlugParam || postSignUpSiteIdParam );
	const customerType = useQuery().get( 'customerType' ) ?? undefined;
	const [ planInterval, setPlanInterval ] = useState< string | undefined >( undefined );

	/**
	 * isWordCampPromo is temporary
	 */
	const isWordCampPromo = new URLSearchParams( location.search ).has( 'utm_source', 'wordcamp' );
	const plansIntent = getPlansIntent( props.flow, isWordCampPromo );

	const hidePlanProps =
		createWithBigSky && isGoalFirstExperiment
			? getHidePlanPropsBasedOnCreateWithBigSky()
			: getHidePlanPropsBasedOnThemeType( selectedThemeType || '' );

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
		const hasPaidDesign = Boolean(
			selectedDesign?.design_tier && selectedDesign?.design_tier !== 'free'
		);
		const isOnboarding = isOnboardingFlow( props.flow ) && isGoalFirstExperiment;

		if ( ! hasPaidDesign || !! stepInfo.cartItems || ! isOnboarding ) {
			return;
		}

		if ( site ) {
			setPendingAction( async () => {
				return setDesignOnSite( site?.ID, defaultDesign, {
					styleVariation: defaultDesign?.style_variations?.[ 0 ],
					enableThemeSetup: true,
				} ).then( async ( theme: ActiveTheme ) => {
					await updateLaunchpadSettings( site?.ID || '', {
						checklist_statuses: { design_completed: false },
					} );
					return reduxDispatch( setActiveTheme( site?.ID || -1, theme ) );
				} );
			} );
		}
		setSelectedDesign( { ...defaultDesign, default: true } );

		recordTracksEvent( 'calypso_paid_theme_auto_switch', {
			from: selectedDesign?.slug,
			to: defaultDesign?.slug,
		} );
	};
	useQueryTheme( 'wpcom', selectedDesign?.slug );

	if ( isLoadingSelectedTheme ) {
		return <Loading />;
	}

	return (
		<UnifiedPlansStep
			{ ...hidePlanProps }
			selectedSite={ site ?? undefined }
			saveSignupStep={ ( step ) => {
				setStepState( ( mostRecentState = { ...stepState, ...step } ) );
			} }
			submitSignupStep={ ( stepInfo ) => {
				if ( stepInfo.stepName === 'domains' && stepInfo.siteUrl ) {
					setSiteUrl( stepInfo.siteUrl );
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
			intent={ plansIntent ?? undefined }
			onPlanIntervalUpdate={ onPlanIntervalUpdate }
			intervalType={ planInterval }
			wrapperProps={ {
				hideBack: false,
				goBack: props.navigation.goBack,
				isFullLayout: true,
				isExtraWideLayout: false,
			} }
			useStepperWrapper
		/>
	);
}
