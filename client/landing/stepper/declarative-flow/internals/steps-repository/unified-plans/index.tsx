import { OnboardSelect } from '@automattic/data-stores';
import {
	AI_SITE_BUILDER_FLOW,
	DOMAIN_FLOW,
	EXAMPLE_FLOW,
	NEW_HOSTED_SITE_FLOW,
	NEWSLETTER_FLOW,
	ONBOARDING_FLOW,
	ONBOARDING_UNIFIED_FLOW,
	PLAN_UPGRADE_FLOW,
	START_WRITING_FLOW,
	WOO_HOSTED_PLANS_FLOW,
	Step,
	useStepPersistedState,
} from '@automattic/onboarding';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useState, useEffect } from 'react';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import Loading from 'calypso/components/loading';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useIsVisualSplitEnabled } from 'calypso/lib/plans/use-visual-split-experiment';
import { getHidePlanPropsBasedOnThemeType } from 'calypso/my-sites/plans-features-main/components/utils/utils';
import { getSignupCompleteSiteID, getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getTheme, getThemeType } from 'calypso/state/themes/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { playgroundPlansIntent } from '../playground/lib/plans';
import UnifiedPlansStep from './unified-plans-step';
import { getIntervalType, getVisualSplitPlansIntent, SupportedIntervalTypes } from './util';
import type { Step as StepType } from '../../types';
import type { PlansIntent } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './style.scss';

/**
 * Copied from steps-repository/plans (which should be removed)
 */
/**
 * Copied from steps-repository/plans (which should be removed)
 */
function getPlansIntent( flowName: string | null ): PlansIntent | null {
	const search = new URLSearchParams( location.search );

	switch ( flowName ) {
		case START_WRITING_FLOW:
			return 'plans-blog-onboarding';
		case NEWSLETTER_FLOW:
		case EXAMPLE_FLOW:
			return 'plans-newsletter';
		case NEW_HOSTED_SITE_FLOW:
			/**
			 * isWordCampPromo is temporary
			 */
			if ( search.has( 'utm_source', 'wordcamp' ) ) {
				return 'plans-new-hosted-site-business-only';
			}

			return 'plans-new-hosted-site';
		case AI_SITE_BUILDER_FLOW:
			return 'plans-ai-assembler-free-trial';
		case ONBOARDING_FLOW:
			if ( search.has( 'playground' ) ) {
				return playgroundPlansIntent( search.get( 'playground' )! );
			}
			if ( search.has( 'intent' ) ) {
				return getVisualSplitPlansIntent( search.get( 'intent' )! );
			}
			break;
		case ONBOARDING_UNIFIED_FLOW:
			return 'plans-affiliate';
		case PLAN_UPGRADE_FLOW:
			return 'plans-upgrade';
		case WOO_HOSTED_PLANS_FLOW:
			return 'plans-woo-hosted';
		default:
			return null;
	}
	return null;
}

type ProvidedDependencies = {
	stepName: 'plans';
	cartItems: MinimalRequestCartProduct[] | null;
};

const PlansStepAdaptor: StepType< {
	submits: ProvidedDependencies;
	accepts: {
		isInSignup?: boolean;
		isStepperUpgradeFlow?: boolean;
		selectedFeature?: string;
		displayedIntervals?: SupportedIntervalTypes[];
		wrapperProps?: {
			hideBack?: boolean;
			goBack?: () => void;
			isFullLayout?: boolean;
			isExtraWideLayout?: boolean;
		};
	};
} > = ( props ) => {
	const { displayedIntervals, isInSignup, isStepperUpgradeFlow, selectedFeature, wrapperProps } =
		props;
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();

	const { siteTitle, domainItem, domainItems, selectedDesign, hideFreePlan } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			const {
				getSelectedSiteTitle,
				getDomainCartItem,
				getDomainCartItems,
				getSelectedDesign,
				getHideFreePlan,
			} = select( ONBOARD_STORE );
			return {
				siteTitle: getSelectedSiteTitle(),
				domainItem: getDomainCartItem(),
				domainItems: getDomainCartItems(),
				selectedDesign: getSelectedDesign(),
				hideFreePlan: getHideFreePlan(),
			};
		},
		[]
	);
	const username = useSelector( getCurrentUserName );
	const coupon = useQuery().get( 'coupon' ) ?? undefined;
	const { setSiteUrl } = useWPDispatch( ONBOARD_STORE );

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

	useQueryTheme( 'wpcom', selectedDesign?.slug );

	const [ isVisualSplitLoading, visualSplitVariation ] = useIsVisualSplitEnabled( props.flow );
	const defaultPlansIntent = getPlansIntent( props.flow );
	const [ plansIntent, setPlansIntent ] = useState< PlansIntent | null >( defaultPlansIntent );

	// Update plansIntent when the experiment loads
	useEffect( () => {
		if (
			! isVisualSplitLoading &&
			props.flow === ONBOARDING_FLOW &&
			visualSplitVariation &&
			! defaultPlansIntent
		) {
			setPlansIntent( getVisualSplitPlansIntent( visualSplitVariation as string ) );
		}
	}, [ isVisualSplitLoading, visualSplitVariation, props.flow, defaultPlansIntent ] );

	const handleIntentChange = ( newIntent: PlansIntent ) => {
		setPlansIntent( newIntent );
	};

	/**
	 * The plans step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
	 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
	 */
	let mostRecentState: ProvidedDependencies;

	const onPlanIntervalUpdate = ( path: string ) => {
		const intervalType = getIntervalType( path );
		setPlanInterval( intervalType );
	};

	const isUsingStepContainerV2 =
		shouldUseStepContainerV2( props.flow ) || props.flow === DOMAIN_FLOW;

	if ( isLoadingSelectedTheme ) {
		return isUsingStepContainerV2 ? <Step.Loading /> : <Loading />;
	}

	return (
		<UnifiedPlansStep
			{ ...getHidePlanPropsBasedOnThemeType( selectedThemeType || '' ) }
			hideFreePlan={ hideFreePlan }
			selectedSite={ site ?? undefined }
			saveSignupStep={ ( step ) => {
				setStepState( ( mostRecentState = { ...stepState, ...step } as ProvidedDependencies ) );
			} }
			submitSignupStep={ ( stepInfo ) => {
				if ( stepInfo.stepName === 'domains' && stepInfo.siteUrl ) {
					setSiteUrl( stepInfo.siteUrl );
				} else {
					setStepState(
						( mostRecentState = { ...stepState, ...( stepInfo as ProvidedDependencies ) } )
					);
				}
			} }
			goToNextStep={ () => {
				props.navigation.submit?.( { ...stepState, ...mostRecentState } );
			} }
			step={
				stepState as {
					status?: string | undefined;
					errors?: { message: string } | undefined;
				}
			}
			customerType={ customerType }
			signupDependencies={ signupDependencies }
			stepName="plans"
			flowName={ props.flow }
			intent={ plansIntent ?? undefined }
			onIntentChange={ handleIntentChange }
			onPlanIntervalUpdate={ onPlanIntervalUpdate }
			intervalType={ planInterval }
			displayedIntervals={ displayedIntervals }
			wrapperProps={ {
				hideBack: wrapperProps?.hideBack ?? false,
				goBack: wrapperProps?.goBack ?? props.navigation.goBack,
				isFullLayout: wrapperProps?.isFullLayout ?? true,
				isExtraWideLayout: wrapperProps?.isExtraWideLayout ?? false,
			} }
			useStepperWrapper
			useStepContainerV2={ isUsingStepContainerV2 }
			isInSignup={ isInSignup }
			isStepperUpgradeFlow={ isStepperUpgradeFlow }
			selectedFeature={ selectedFeature }
		/>
	);
};

export default PlansStepAdaptor;
