import { OnboardSelect } from '@automattic/data-stores';
import {
	AI_SITE_BUILDER_FLOW,
	EXAMPLE_FLOW,
	NEW_HOSTED_SITE_FLOW,
	NEWSLETTER_FLOW,
	START_WRITING_FLOW,
	Step,
	useStepPersistedState,
} from '@automattic/onboarding';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useState } from 'react';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import Loading from 'calypso/components/loading';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getHidePlanPropsBasedOnThemeType } from 'calypso/my-sites/plans-features-main/components/utils/utils';
import { getSignupCompleteSiteID, getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getTheme, getThemeType } from 'calypso/state/themes/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import UnifiedPlansStep from './unified-plans-step';
import { getIntervalType } from './util';
import type { ProvidedDependencies, Step as StepType } from '../../types';
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

const PlansStepAdaptor: StepType< {
	// TODO: work on more specific types
	submits: Record< string, unknown >;
} > = ( props ) => {
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();

	const { siteTitle, domainItem, domainItems, selectedDesign } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			const { getSelectedSiteTitle, getDomainCartItem, getDomainCartItems, getSelectedDesign } =
				select( ONBOARD_STORE );
			return {
				siteTitle: getSelectedSiteTitle(),
				domainItem: getDomainCartItem(),
				domainItems: getDomainCartItems(),
				selectedDesign: getSelectedDesign(),
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

	/**
	 * isWordCampPromo is temporary
	 */
	const isWordCampPromo = new URLSearchParams( location.search ).has( 'utm_source', 'wordcamp' );
	const plansIntent = getPlansIntent( props.flow, isWordCampPromo );

	let hidePlanProps;
	if ( props.flow === AI_SITE_BUILDER_FLOW ) {
		hidePlanProps = {
			hideFreePlan: true,
			hidePersonalPlan: true,
			hideEcommercePlan: true,
			hideEnterprisePlan: true,
		};
	} else {
		hidePlanProps = getHidePlanPropsBasedOnThemeType( selectedThemeType || '' );
	}

	/**
	 * The plans step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
	 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
	 */
	let mostRecentState: ProvidedDependencies;

	const onPlanIntervalUpdate = ( path: string ) => {
		const intervalType = getIntervalType( path );
		setPlanInterval( intervalType );
	};

	useQueryTheme( 'wpcom', selectedDesign?.slug );

	const isUsingStepContainerV2 = shouldUseStepContainerV2( props.flow );

	if ( isLoadingSelectedTheme ) {
		return isUsingStepContainerV2 ? <Step.Loading /> : <Loading />;
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
			useStepContainerV2={ isUsingStepContainerV2 }
		/>
	);
};

export default PlansStepAdaptor;
