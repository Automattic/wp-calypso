import config from '@automattic/calypso-config';
import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import {
	START_WRITING_FLOW,
	isLinkInBioFlow,
	isNewsletterFlow,
	NEWSLETTER_FLOW,
	NEW_HOSTED_SITE_FLOW,
	isNewHostedSiteCreationFlow,
	isDomainUpsellFlow,
	DESIGN_FIRST_FLOW,
	isBlogOnboardingFlow,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import React, { useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useSaveHostingFlowPathStep } from 'calypso/landing/stepper/hooks/use-save-hosting-flow-path-step';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import PlanFAQ from 'calypso/my-sites/plans-features-main/components/plan-faq';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getIntervalType } from 'calypso/signup/steps/plans/util';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ONBOARD_STORE } from '../../../../stores';
import type { OnboardSelect } from '@automattic/data-stores';
import type { PlansIntent } from '@automattic/plans-grid-next';
import './style.scss';

interface Props {
	shouldIncludeFAQ?: boolean;
	flowName: string | null;
	onSubmit: ( planCartItem: MinimalRequestCartProduct | null ) => void;
}

function getPlansIntent( flowName: string | null, isWordCampPromo?: boolean ): PlansIntent | null {
	switch ( flowName ) {
		case START_WRITING_FLOW:
		case DESIGN_FIRST_FLOW:
			return 'plans-blog-onboarding';
		case NEWSLETTER_FLOW:
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

const PlansWrapper: React.FC< Props > = ( props ) => {
	const {
		hideFreePlan: reduxHideFreePlan,
		domainCartItem,
		hidePlansFeatureComparison,
		couponCode,
	} = useSelect( ( select ) => {
		return {
			hideFreePlan: ( select( ONBOARD_STORE ) as OnboardSelect ).getHideFreePlan(),
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			domainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems(),
			hidePlansFeatureComparison: (
				select( ONBOARD_STORE ) as OnboardSelect
			 ).getHidePlansFeatureComparison(),
			couponCode: ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
		};
	}, [] );
	const { flowName } = props;

	const { setPlanCartItem, setDomain, setDomainCartItem, setProductCartItems } =
		useDispatch( ONBOARD_STORE );

	const site = useSite();
	const currentPath = window.location.pathname + window.location.search;

	useSaveHostingFlowPathStep( flowName, currentPath );

	const [ planIntervalPath, setPlanIntervalPath ] = useState< string >( '' );
	const { __ } = useI18n();
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();
	const navigate = useNavigate();
	const location = useLocation();

	const stepName = 'plans';
	const customerType = 'personal';
	const headerText = __( 'Choose a plan' );
	const isInSignup = isDomainUpsellFlow( flowName ) ? false : true;
	/**
	 * isWordCampPromo is temporary
	 */
	const isWordCampPromo = new URLSearchParams( location.search ).has( 'utm_source', 'wordcamp' );
	const plansIntent = getPlansIntent( flowName, isWordCampPromo );

	const hideFreePlan = plansIntent
		? reduxHideFreePlan && 'plans-blog-onboarding' === plansIntent
		: reduxHideFreePlan;

	useLayoutEffect( () => {
		// Plan intervals are changed by parsing query params. Updating query params
		// with react-router, however, rerenders the whole page. The effect is that,
		// whenever a new plan interval is selected, the viewport is reset to the top
		// of the page. Because of this, we manually restore scroll position here.
		// Ideally we'd switch to using react-router <ScrollRestoration> whenever stepper
		// flows are refactored to use a data router
		document.documentElement.scrollTop = location.state?.scrollTop || 0;
	}, [ location.state?.scrollTop, planIntervalPath ] );

	const onPlanIntervalUpdate = ( path: string ) => {
		setPlanIntervalPath( path );

		navigate( path, {
			preventScrollReset: true,
			replace: true,
			state: { scrollTop: document.documentElement.scrollTop },
		} );
	};

	const onUpgradeClick = ( cartItems?: MinimalRequestCartProduct[] | null ) => {
		const planCartItem = getPlanCartItem( cartItems );
		if ( planCartItem ) {
			recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: planCartItem?.product_slug,
				from_section: 'default',
			} );
		} else {
			recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: 'default',
			} );
		}

		const cartItemForStorageAddOn = cartItems?.find(
			( items ) => items.product_slug === PRODUCT_1GB_SPACE
		);

		cartItemForStorageAddOn && setProductCartItems( [ cartItemForStorageAddOn ] );
		setPlanCartItem( planCartItem );
		props.onSubmit?.( planCartItem );
	};

	const getPaidDomainName = () => {
		return domainCartItem?.meta;
	};

	const handleFreePlanButtonClick = () => {
		onUpgradeClick( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
		props.onSubmit( null );
	};

	const removePaidDomain = () => {
		setDomainCartItem( null );
	};

	const setSiteUrlAsFreeDomainSuggestion = ( freeDomainSuggestion: { domain_name: string } ) => {
		setDomain( freeDomainSuggestion );
	};

	const plansFeaturesList = () => {
		return (
			<div>
				<PlansFeaturesMain
					siteId={ site?.ID }
					displayedIntervals={ [ 'yearly', '2yearly', '3yearly', 'monthly' ] }
					hideFreePlan={ hideFreePlan }
					isInSignup={ isInSignup }
					isStepperUpgradeFlow
					intervalType={ getIntervalType() }
					onUpgradeClick={ onUpgradeClick }
					paidDomainName={ getPaidDomainName() }
					customerType={ customerType }
					plansWithScroll={ isDesktop }
					flowName={ flowName }
					hidePlansFeatureComparison={ hidePlansFeatureComparison || isWordCampPromo }
					intent={ plansIntent }
					removePaidDomain={ removePaidDomain }
					setSiteUrlAsFreeDomainSuggestion={ setSiteUrlAsFreeDomainSuggestion }
					renderSiblingWhenLoaded={ () => props.shouldIncludeFAQ && <PlanFAQ /> }
					showPlanTypeSelectorDropdown={ config.isEnabled( 'onboarding/interval-dropdown' ) }
					hidePlanTypeSelector={ isWordCampPromo }
					onPlanIntervalUpdate={ onPlanIntervalUpdate }
					coupon={ couponCode }
				/>
			</div>
		);
	};

	const getHeaderText = () => {
		if ( isNewHostedSiteCreationFlow( flowName ) ) {
			return __( 'The right plan for the right project' );
		}

		if ( isDomainUpsellFlow( flowName ) ) {
			return __( 'Choose your flavor of WordPress' );
		}

		if (
			isNewsletterFlow( flowName ) ||
			isBlogOnboardingFlow( flowName ) ||
			isLinkInBioFlow( flowName )
		) {
			return __( `There's a plan for you.` );
		}

		if ( isDesktop ) {
			return headerText;
		}

		return __( "Pick a plan that's right for you." );
	};

	const getSubHeaderText = () => {
		const freePlanButton = (
			<Button onClick={ handleFreePlanButtonClick } className="is-borderless" />
		);

		if (
			isBlogOnboardingFlow( flowName ) ||
			isNewsletterFlow( flowName ) ||
			isLinkInBioFlow( flowName ) ||
			isDomainUpsellFlow( flowName )
		) {
			return;
		}

		if ( isNewHostedSiteCreationFlow( flowName ) ) {
			return translate(
				'Get the advanced features you need without ever thinking about overages.'
			);
		}

		if ( ! hideFreePlan ) {
			return translate(
				`Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.`,
				{ components: { link: freePlanButton } }
			);
		}

		return;
	};

	const plansFeaturesSelection = () => {
		const headerText = getHeaderText();
		const fallbackHeaderText = headerText;
		const subHeaderText = getSubHeaderText();
		const fallbackSubHeaderText = subHeaderText;

		return (
			<>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					shouldHideNavButtons
					fallbackHeaderText={ fallbackHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ false }
					isExtraWideLayout
					stepContent={ plansFeaturesList() }
					allowBackFirstStep={ false }
				/>
			</>
		);
	};

	const classes = clsx( 'plans-step', {
		'has-no-sidebar': true,
		'is-wide-layout': false,
		'is-extra-wide-layout': true,
	} );

	return (
		<div className="stepper-plans">
			<div className={ classes }>{ plansFeaturesSelection() }</div>
		</div>
	);
};

export default localize( PlansWrapper );
