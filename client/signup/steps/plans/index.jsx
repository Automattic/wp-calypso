import { isEnabled } from '@automattic/calypso-config';
import {
	planHasFeature,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	getPlan,
	PLAN_FREE,
	isEcommerce,
} from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
import {
	isLinkInBioFlow,
	NEWSLETTER_FLOW,
	isNewsletterOrLinkInBioFlow,
} from '@automattic/onboarding';
import { isTailoredSignupFlow } from '@automattic/onboarding/src';
import { isDesktop, subscribeIsDesktop } from '@automattic/viewport';
import classNames from 'classnames';
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse as parseQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getTld, isSubdomain } from 'calypso/lib/domains';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import wp from 'calypso/lib/wp';
import PlansComparison, {
	isEligibleForProPlan,
	isStarterPlanEnabled,
} from 'calypso/my-sites/plans-comparison';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { ExperimentalIntervalTypeToggle } from 'calypso/my-sites/plans-features-main/plan-type-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import './style.scss';

export class PlansStep extends Component {
	state = {
		isDesktop: isDesktop(),
	};

	componentDidMount() {
		this.unsubscribe = subscribeIsDesktop( ( matchesDesktop ) =>
			this.setState( { isDesktop: matchesDesktop } )
		);
		this.props.saveSignupStep( { stepName: this.props.stepName } );

		if ( isTailoredSignupFlow( this.props.flowName ) ) {
			// trigger guides on this step, we don't care about failures or response
			wp.req.post(
				'guides/trigger',
				{
					apiNamespace: 'wpcom/v2/',
				},
				{
					flow: this.props.flowName,
					step: 'plans',
				}
			);
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	onSelectPlan = ( cartItem ) => {
		const {
			additionalStepData,
			stepSectionName,
			stepName,
			flowName,
			themeSlugWithRepo,
			launchSite,
			goToNextStep,
		} = this.props;

		if ( cartItem ) {
			this.props.recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default',
			} );

			// If we're inside the store signup flow and the cart item is a Business or eCommerce Plan,
			// set a flag on it. It will trigger Automated Transfer when the product is being
			// activated at the end of the checkout process.
			if (
				flowName === 'ecommerce' &&
				planHasFeature( cartItem.product_slug, FEATURE_UPLOAD_THEMES_PLUGINS )
			) {
				cartItem.extra = Object.assign( cartItem.extra || {}, {
					is_store_signup: true,
				} );
			}
		} else {
			this.props.recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			stepName,
			stepSectionName,
			cartItem,
			...additionalStepData,
		};

		if ( flowName === 'site-selected' && ! cartItem ) {
			wp.req.post(
				`/domains/${ this.props.selectedSite.ID }/${ this.props.selectedSite.name }/convert-domain-only-to-site`,
				{},
				( error ) => {
					if ( error ) {
						this.props.errorNotice( error.message );
						return;
					}
					this.props.submitSignupStep( step, {
						cartItem,
					} );
					goToNextStep();
				}
			);
			return;
		}

		const signupVals = {
			cartItem,
			...( themeSlugWithRepo && { themeSlugWithRepo } ),
			...( launchSite && { comingSoon: 0 } ),
		};

		if ( cartItem && isEcommerce( cartItem ) ) {
			signupVals.themeSlugWithRepo = 'pub/twentytwentytwo';
		}

		this.props.submitSignupStep( step, signupVals );
		goToNextStep();
	};

	getDomainName() {
		return (
			this.props.signupDependencies.domainItem && this.props.signupDependencies.domainItem.meta
		);
	}

	getCustomerType() {
		if ( this.props.customerType ) {
			return this.props.customerType;
		}

		const customerType =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'customerType' ) || 'personal';

		return customerType;
	}

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	getIntervalType() {
		const urlParts = getUrlParts( typeof window !== 'undefined' ? window.location?.href : '' );
		const intervalType = urlParts?.searchParams.get( 'intervalType' );

		if ( [ 'yearly', 'monthly' ].includes( intervalType ) ) {
			return intervalType;
		}

		// Default value
		return 'yearly';
	}

	plansFeaturesList() {
		const {
			disableBloggerPlanWithNonBlogDomain,
			hideFreePlan,
			isLaunchPage,
			selectedSite,
			planTypes,
			flowName,
			showTreatmentPlansReorderTest,
			isInVerticalScrollingPlansExperiment,
			isReskinned,
			eligibleForProPlan,
		} = this.props;

		let errorDisplay;
		if ( 'invalid' === this.props.step?.status ) {
			errorDisplay = (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
				</div>
			);
		}

		if ( ! this.props.plansLoaded ) {
			return this.renderLoading();
		}

		if ( eligibleForProPlan ) {
			const selectedDomainConnection =
				this.props.progress?.domains?.domainItem?.product_slug === 'domain_map';
			const intervalType = this.getIntervalType();
			return (
				<div>
					{ errorDisplay }
					<ExperimentalIntervalTypeToggle
						intervalType={ intervalType }
						isInSignup={ true }
						plans={ [] }
						eligibleForWpcomMonthlyPlans={ true }
					/>
					<PlansComparison
						isInSignup={ true }
						intervalType={ intervalType }
						onSelectPlan={ this.onSelectPlan }
						selectedSiteId={ selectedSite?.ID || undefined }
						selectedDomainConnection={ selectedDomainConnection }
					/>
				</div>
			);
		}

		return (
			<div>
				{ errorDisplay }
				<PlansFeaturesMain
					site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					showFAQ={ this.state.isDesktop && ! this.isTailoredFlow() }
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					isLaunchPage={ isLaunchPage }
					intervalType={ this.getIntervalType() }
					onUpgradeClick={ this.onSelectPlan }
					domainName={ this.getDomainName() }
					customerType={ this.getCustomerType() }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					plansWithScroll={ this.state.isDesktop }
					planTypes={ planTypes }
					flowName={ flowName }
					showTreatmentPlansReorderTest={ showTreatmentPlansReorderTest }
					isAllPaidPlansShown={ true }
					isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
					shouldShowPlansFeatureComparison={ this.state.isDesktop } // Show feature comparison layout in signup flow and desktop resolutions
					isReskinned={ isReskinned }
				/>
			</div>
		);
	}

	renderLoading() {
		return (
			<div className="plans__loading">
				<LoadingEllipsis active />
			</div>
		);
	}

	getHeaderText() {
		const { headerText, translate, eligibleForProPlan, locale, isOnboarding2023PricingGrid } =
			this.props;

		if ( headerText ) {
			return headerText;
		}

		if ( eligibleForProPlan ) {
			return 'en' === locale || i18n.hasTranslation( 'Choose the right plan for you' )
				? translate( 'Choose the right plan for you' )
				: translate( 'Choose the plan that’s right for you' );
		}

		if ( isOnboarding2023PricingGrid ) {
			return translate( 'Choose your flavor of WordPress' );
		}

		if ( this.state.isDesktop ) {
			return translate( 'Choose a plan' );
		}

		return translate( "Pick a plan that's right for you." );
	}

	getSubHeaderText() {
		const {
			eligibleForProPlan,
			flowName,
			hideFreePlan,
			locale,
			translate,
			useEmailOnboardingSubheader,
			isOnboarding2023PricingGrid,
		} = this.props;

		const freePlanButton = <Button onClick={ this.handleFreePlanButtonClick } borderless />;

		if ( flowName === NEWSLETTER_FLOW ) {
			return hideFreePlan
				? translate( 'Unlock a powerful bundle of features for your Newsletter.' )
				: translate(
						`Unlock a powerful bundle of features for your Newsletter. Or {{link}}start with a free plan{{/link}}.`,
						{ components: { link: freePlanButton } }
				  );
		}
		if ( isLinkInBioFlow( flowName ) ) {
			return hideFreePlan
				? translate( 'Unlock a powerful bundle of features for your Link in Bio.' )
				: translate(
						`Unlock a powerful bundle of features for your Link in Bio. Or {{link}}start with a free plan{{/link}}.`,
						{ components: { link: freePlanButton } }
				  );
		}

		if ( eligibleForProPlan ) {
			if ( isStarterPlanEnabled() ) {
				return hideFreePlan
					? translate( 'Try risk-free with a 14-day money-back guarantee.' )
					: translate(
							'Try risk-free with a 14-day money-back guarantee or {{link}}start with a free site{{/link}}.',
							{ components: { link: freePlanButton } }
					  );
			}

			return 'en' === locale ||
				i18n.hasTranslation( 'he WordPress Pro plan comes with a 14-day money back guarantee' )
				? translate( 'The WordPress Pro plan comes with a 14-day money back guarantee' )
				: translate( 'The WordPress Pro plan comes with a 14-day full money back guarantee' );
		}

		if ( useEmailOnboardingSubheader ) {
			return translate(
				'Add more features to your professional website with a plan. Or {{link}}start with email and a free site{{/link}}.',
				{ components: { link: freePlanButton } }
			);
		}

		if ( isOnboarding2023PricingGrid ) {
			return;
		}

		if ( this.state.isDesktop ) {
			return translate(
				"Pick one that's right for you and unlock features that help you grow. Or {{link}}start with a free site{{/link}}.",
				{ components: { link: freePlanButton } }
			);
		}

		return translate( 'Choose a plan or {{link}}start with a free site{{/link}}.', {
			components: { link: freePlanButton },
		} );
	}

	isTailoredFlow() {
		return isNewsletterOrLinkInBioFlow( this.props.flowName );
	}

	plansFeaturesSelection() {
		const { flowName, stepName, positionInFlow, translate, hasInitializedSitesBackUrl, steps } =
			this.props;

		const headerText = this.getHeaderText();
		const fallbackHeaderText = this.props.fallbackHeaderText || headerText;
		const subHeaderText = this.getSubHeaderText();
		const fallbackSubHeaderText = this.props.fallbackSubHeaderText || subHeaderText;

		let backUrl;
		let backLabelText;

		if ( 0 === positionInFlow && hasInitializedSitesBackUrl ) {
			backUrl = hasInitializedSitesBackUrl;
			backLabelText = translate( 'Back to Sites' );
		}

		let queryParams;
		if ( ! isNaN( Number( positionInFlow ) ) && 0 !== positionInFlow ) {
			const previousStepName = steps[ this.props.positionInFlow - 1 ];
			const previousStep = this.props.progress?.[ previousStepName ];

			const isComingFromUseYourDomainStep = 'use-your-domain' === previousStep?.stepSectionName;

			if ( isComingFromUseYourDomainStep ) {
				queryParams = {
					...this.props.queryParams,
					step: 'transfer-or-connect',
					initialQuery: previousStep?.siteUrl,
				};
			}
		}

		return (
			<>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					shouldHideNavButtons={ this.isTailoredFlow() }
					fallbackHeaderText={ fallbackHeaderText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ true }
					stepContent={ this.plansFeaturesList() }
					allowBackFirstStep={ !! hasInitializedSitesBackUrl }
					backUrl={ backUrl }
					backLabelText={ backLabelText }
					queryParams={ queryParams }
				/>
			</>
		);
	}

	render() {
		const classes = classNames( 'plans plans-step', {
			'in-vertically-scrolled-plans-experiment':
				! this.props.isOnboarding2023PricingGrid && this.props.isInVerticalScrollingPlansExperiment,
			'has-no-sidebar': true,
			'is-wide-layout': true,
		} );

		return (
			<>
				<QueryPlans />
				<MarketingMessage path="signup/plans" />
				<div className={ classes }>{ this.plansFeaturesSelection() }</div>
			</>
		);
	}
}

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	disableBloggerPlanWithNonBlogDomain: PropTypes.bool,
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
	planTypes: PropTypes.array,
	flowName: PropTypes.string,
	isTreatmentPlansReorderTest: PropTypes.bool,
};

/**
 * Checks if the domainItem picked in the domain step is a top level .blog domain -
 * we only want to make Blogger plan available if it is.
 *
 * @param {Object} domainItem domainItem object stored in the "choose domain" step
 * @returns {boolean} is .blog domain registration
 */
export const isDotBlogDomainRegistration = ( domainItem ) => {
	if ( ! domainItem ) {
		return false;
	}
	const { is_domain_registration, meta } = domainItem;

	return is_domain_registration && getTld( meta ) === 'blog';
};

export default connect(
	(
		state,
		{ path, flowName, signupDependencies: { siteSlug, domainItem, plans_reorder_abtest_variation } }
	) => ( {
		// Blogger plan is only available if user chose either a free domain or a .blog domain registration
		disableBloggerPlanWithNonBlogDomain:
			domainItem && ! isSubdomain( domainItem.meta ) && ! isDotBlogDomainRegistration( domainItem ),
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		customerType: parseQs( path.split( '?' ).pop() ).customerType,
		siteType: getSiteType( state ),
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
		showTreatmentPlansReorderTest:
			'treatment' === plans_reorder_abtest_variation || isTreatmentPlansReorderTest( state ),
		isLoadingExperiment: false,
		// IMPORTANT NOTE: The following is always set to true. It's a hack to resolve the bug reported
		// in https://github.com/Automattic/wp-calypso/issues/50896, till a proper cleanup and deploy of
		// treatment for the `vertical_plan_listing_v2` experiment is implemented.
		isInVerticalScrollingPlansExperiment: true,
		plansLoaded: Boolean( getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 ) ),
		eligibleForProPlan: isEligibleForProPlan( state, getSiteBySlug( state, siteSlug )?.ID ),
		isOnboarding2023PricingGrid:
			isEnabled( 'onboarding/2023-pricing-grid' ) && flowName === 'onboarding-2023-pricing-grid',
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep, errorNotice }
)( localize( PlansStep ) );
