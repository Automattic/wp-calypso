import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import {
	START_WRITING_FLOW,
	isLinkInBioFlow,
	isNewsletterFlow,
	NEWSLETTER_FLOW,
	LINK_IN_BIO_FLOW,
	NEW_HOSTED_SITE_FLOW,
	isNewHostedSiteCreationFlow,
	isDomainUpsellFlow,
	DESIGN_FIRST_FLOW,
	isBlogOnboardingFlow,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import PlanFAQ from 'calypso/my-sites/plans-features-main/components/plan-faq';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getIntervalType } from 'calypso/signup/steps/plans/util';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import type { OnboardSelect } from '@automattic/data-stores';
import type { PlansIntent } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';
import './style.scss';

interface Props {
	shouldIncludeFAQ?: boolean;
	flowName: string | null;
	onSubmit: ( pickedPlan: MinimalRequestCartProduct | null ) => void;
	plansLoaded: boolean;
}

function getPlansIntent( flowName: string | null ): PlansIntent | null {
	switch ( flowName ) {
		case START_WRITING_FLOW:
		case DESIGN_FIRST_FLOW:
			return 'plans-blog-onboarding';
		case NEWSLETTER_FLOW:
			return 'plans-newsletter';
		case LINK_IN_BIO_FLOW:
			return 'plans-link-in-bio';
		case NEW_HOSTED_SITE_FLOW:
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
	} = useSelect( ( select ) => {
		return {
			hideFreePlan: ( select( ONBOARD_STORE ) as OnboardSelect ).getHideFreePlan(),
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			hidePlansFeatureComparison: (
				select( ONBOARD_STORE ) as OnboardSelect
			 ).getHidePlansFeatureComparison(),
		};
	}, [] );
	const { flowName } = props;

	const { setPlanCartItem, setDomain, setDomainCartItem } = useDispatch( ONBOARD_STORE );

	const site = useSite();
	const { __ } = useI18n();
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();
	const stepName = 'plans';
	const isReskinned = true;
	const customerType = 'personal';
	const isInVerticalScrollingPlansExperiment = true;
	const headerText = __( 'Choose a plan' );
	const plansIntent = getPlansIntent( flowName );
	const hideFreePlan = plansIntent
		? reduxHideFreePlan && 'plans-blog-onboarding' === plansIntent
		: reduxHideFreePlan;

	const onSelectPlan = ( cartItems?: MinimalRequestCartProduct[] | null ) => {
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

		setPlanCartItem( planCartItem );
		props.onSubmit?.( planCartItem );
	};

	const getPaidDomainName = () => {
		return domainCartItem?.meta;
	};

	const handleFreePlanButtonClick = () => {
		onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
		props.onSubmit( null );
	};

	const renderLoading = () => {
		return (
			<div className="plans__loading">
				<LoadingEllipsis className="active" />
			</div>
		);
	};

	const removePaidDomain = () => {
		setDomainCartItem( null );
	};

	const setSiteUrlAsFreeDomainSuggestion = ( freeDomainSuggestion: { domain_name: string } ) => {
		setDomain( freeDomainSuggestion );
	};

	const plansFeaturesList = () => {
		if ( ! props.plansLoaded ) {
			return renderLoading();
		}

		return (
			<div>
				<PlansFeaturesMain
					isPlansInsideStepper={ true }
					siteId={ site?.ID }
					showBiennialToggle={ false }
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					isStepperUpgradeFlow={ true }
					intervalType={ getIntervalType() }
					onUpgradeClick={ onSelectPlan }
					paidDomainName={ getPaidDomainName() }
					customerType={ customerType }
					plansWithScroll={ isDesktop }
					flowName={ flowName }
					isReskinned={ isReskinned }
					hidePlansFeatureComparison={ hidePlansFeatureComparison }
					intent={ plansIntent }
					removePaidDomain={ removePaidDomain }
					setSiteUrlAsFreeDomainSuggestion={ setSiteUrlAsFreeDomainSuggestion }
				/>
				{ props.shouldIncludeFAQ && <PlanFAQ /> }
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
					shouldHideNavButtons={ true }
					fallbackHeaderText={ fallbackHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ false }
					isExtraWideLayout={ true }
					stepContent={ plansFeaturesList() }
					allowBackFirstStep={ false }
				/>
			</>
		);
	};

	const classes = classNames( 'plans-step', {
		'in-vertically-scrolled-plans-experiment': isInVerticalScrollingPlansExperiment,
		'has-no-sidebar': true,
		'is-wide-layout': false,
		'is-extra-wide-layout': true,
	} );

	return (
		<div className="stepper-plans">
			<QueryPlans />
			<div className={ classes }>{ plansFeaturesSelection() }</div>
		</div>
	);
};

export default connect( ( state ) => {
	return {
		plansLoaded: Boolean( getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 ) ),
	};
} )( localize( PlansWrapper ) );
