import { OnboardSelect } from '@automattic/data-stores';
import { useStepPersistedState } from '@automattic/onboarding';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useState } from 'react';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getHidePlanPropsBasedOnThemeType } from 'calypso/my-sites/plans-features-main/components/utils/utils';
import { getSignupCompleteSiteID, getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getTheme, getThemeType } from 'calypso/state/themes/selectors';
import StepperLoader from '../../components/stepper-loader';
import UnifiedPlansStep from './unified-plans-step';
import { getIntervalType } from './util';
import type { ProvidedDependencies, StepProps } from '../../types';

import './style.scss';

export default function PlansStepAdaptor( props: StepProps ) {
	const [ stepState, setStepState ] = useStepPersistedState< ProvidedDependencies >( 'plans-step' );
	const siteSlug = useSiteSlug();
	const isMobile = useMobileBreakpoint();

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

	const theme = useSelector( ( state ) =>
		selectedDesign ? getTheme( state, 'wpcom', selectedDesign.slug ) : null
	);
	const selectedThemeType = useSelector( ( state ) =>
		theme ? getThemeType( state, theme.id ) : ''
	);
	const isLoadingSelectedTheme = selectedDesign && ! theme;

	const { setDomainCartItem, setDomainCartItems, setSiteUrl } = useWPDispatch( ONBOARD_STORE );

	const signupDependencies = {
		siteSlug,
		siteTitle,
		username,
		coupon,
		domainItem,
		domainCart: domainItems,
		selectedThemeType,
	};

	const postSignUpSiteSlugParam = getSignupCompleteSlug();
	const postSignUpSiteIdParam = getSignupCompleteSiteID();

	const site = useSite( postSignUpSiteSlugParam || postSignUpSiteIdParam );
	const customerType = useQuery().get( 'customerType' ) ?? undefined;
	const [ planInterval, setPlanInterval ] = useState< string | undefined >( undefined );
	const hidePlanProps = getHidePlanPropsBasedOnThemeType( selectedThemeType || '' );

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

	if ( isLoadingSelectedTheme ) {
		return <StepperLoader />;
	}

	return (
		<UnifiedPlansStep
			{ ...hidePlanProps }
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
