// import { subscribeIsDesktop } from '@automattic/viewport';
import {
	getPlan,
	PLAN_FREE,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
} from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
import {
	DOMAIN_UPSELL_FLOW,
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
import { startedInHostingFlow } from 'calypso/landing/stepper/utils/hosting-flow';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

type IntervalType = 'yearly' | 'monthly';
interface Props {
	flowName: string | null;
	onSubmit: ( pickedPlan: MinimalRequestCartProduct | null ) => void;
	plansLoaded: boolean;
	hostingFlow: boolean;
}

function getPlanTypes( flowName: string | null, hideFreePlan: boolean, hostingFlow: boolean ) {
	switch ( flowName ) {
		case START_WRITING_FLOW:
		case DESIGN_FIRST_FLOW:
			return hideFreePlan
				? [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ]
				: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
		case NEWSLETTER_FLOW:
			return [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
		case LINK_IN_BIO_FLOW:
			return [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
		case NEW_HOSTED_SITE_FLOW:
			return hostingFlow
				? [ TYPE_BUSINESS, TYPE_ECOMMERCE ]
				: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
		default:
			return undefined;
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

	const { setPlanCartItem } = useDispatch( ONBOARD_STORE );

	const site = useSite();
	const { __ } = useI18n();

	const isDesktop = useDesktopBreakpoint();
	const stepName = 'plans';
	const isReskinned = true;
	const customerType = 'personal';
	const isInVerticalScrollingPlansExperiment = true;
	const planTypes = getPlanTypes( props?.flowName, reduxHideFreePlan, props.hostingFlow );
	const headerText = __( 'Choose a plan' );
	const isInSignup = props?.flowName === DOMAIN_UPSELL_FLOW ? false : true;

	const hideFreePlan = planTypes ? ! planTypes.includes( TYPE_FREE ) : reduxHideFreePlan;

	const translate = useTranslate();

	const onSelectPlan = ( selectedPlan: any ) => {
		if ( selectedPlan ) {
			recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: selectedPlan?.product_slug,
				free_trial: selectedPlan?.free_trial,
				from_section: 'default',
			} );
		} else {
			recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: 'default',
			} );
		}

		setPlanCartItem( selectedPlan );
		props.onSubmit?.( selectedPlan );
	};

	const getDomainName = () => {
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

	const getIntervalType: () => IntervalType = () => {
		const urlParts = getUrlParts( typeof window !== 'undefined' ? window.location?.href : '' );
		const intervalType = urlParts?.searchParams.get( 'intervalType' );
		switch ( intervalType ) {
			case 'monthly':
			case 'yearly':
				return intervalType as IntervalType;
			default:
				return 'yearly';
		}
	};

	const plansFeaturesList = () => {
		const { flowName } = props;

		if ( ! props.plansLoaded ) {
			return renderLoading();
		}

		return (
			<div>
				<PlansFeaturesMain
					isPlansInsideStepper={ true }
					site={ site || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					hideFreePlan={ hideFreePlan }
					isInSignup={ isInSignup }
					isStepperUpgradeFlow={ true }
					intervalType={ getIntervalType() }
					onUpgradeClick={ onSelectPlan }
					domainName={ getDomainName() }
					customerType={ customerType }
					plansWithScroll={ isDesktop }
					planTypes={ planTypes }
					flowName={ flowName }
					isAllPaidPlansShown={ true }
					isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
					shouldShowPlansFeatureComparison={ isDesktop } // Show feature comparison layout in signup flow and desktop resolutions
					isReskinned={ isReskinned }
					hidePlansFeatureComparison={ hidePlansFeatureComparison }
				/>
			</div>
		);
	};

	const getHeaderText = () => {
		const { flowName } = props;
		if ( flowName === DOMAIN_UPSELL_FLOW || isNewHostedSiteCreationFlow( flowName ) ) {
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
		const { flowName } = props;

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
			return translate( 'Welcome to the best place for your WordPress website.' );
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
		const { flowName } = props;

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
		hostingFlow: startedInHostingFlow( state ),
	};
} )( localize( PlansWrapper ) );
