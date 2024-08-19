import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { isSiteAssemblerFlow, isTailoredSignupFlow } from '@automattic/onboarding';
import { isDesktop, subscribeIsDesktop } from '@automattic/viewport';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse as parseQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { getTld, isSubdomain } from 'calypso/lib/domains';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { buildUpgradeFunction } from 'calypso/lib/signup/step-actions';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getIntervalType } from './util';
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
			triggerGuidesForStep( this.props.flowName, 'plans' );
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	onSelectPlan( cartItems ) {
		buildUpgradeFunction( this.props, cartItems );
	}

	getCustomerType() {
		if ( this.props.customerType ) {
			return this.props.customerType;
		}

		return 'personal';
	}

	removePaidDomain = () => {
		const domainItem = undefined;

		this.props.submitSignupStep(
			{
				stepName: 'domains',
				domainItem,
				isPurchasingItem: false,
				stepSectionName: undefined,
			},
			// Since we're removing the paid domain, it means that the user chose to continue
			// with a free domain. Because signupDomainOrigin should reflect the last domain
			// selection status before they land on the checkout page, we switch the value
			// to "free".
			{ domainItem, signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.FREE }
		);
	};

	setSiteUrlAsFreeDomainSuggestion = ( freeDomainSuggestion ) => {
		if ( freeDomainSuggestion?.product_slug ) {
			return;
		}

		const siteUrl = freeDomainSuggestion.domain_name.replace( '.wordpress.com', '' );

		this.props.submitSignupStep(
			{
				stepName: 'domains',
				siteUrl,
			},
			{}
		);
	};

	plansFeaturesList() {
		const {
			disableBloggerPlanWithNonBlogDomain,
			deemphasizeFreePlan: deemphasizeFreePlanFromProps,
			hideFreePlan,
			isLaunchPage,
			selectedSite,
			intent,
			flowName,
		} = this.props;

		const intervalType = getIntervalType( this.props.path );
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

		const { signupDependencies } = this.props;
		const { siteUrl, domainItem, siteTitle, username, coupon } = signupDependencies;

		const paidDomainName = domainItem?.meta;
		let freeWPComSubdomain;
		if ( typeof siteUrl === 'string' && siteUrl.includes( '.wordpress.com' ) ) {
			freeWPComSubdomain = siteUrl;
		}

		// De-emphasize the Free plan as a CTA link on the main onboarding flow, and the guided flow, when a paid domain is picked.
		// More context can be found in p2-p5uIfZ-f5p
		const deemphasizeFreePlan =
			( [ 'onboarding' ].includes( flowName ) && paidDomainName != null ) ||
			deemphasizeFreePlanFromProps;

		return (
			<div>
				{ errorDisplay }
				<PlansFeaturesMain
					paidDomainName={ paidDomainName }
					freeSubdomain={ freeWPComSubdomain }
					siteTitle={ siteTitle }
					signupFlowUserName={ username }
					siteId={ selectedSite?.ID }
					isCustomDomainAllowedOnFreePlan={ this.props.isCustomDomainAllowedOnFreePlan }
					isInSignup
					isLaunchPage={ isLaunchPage }
					intervalType={ intervalType }
					displayedIntervals={ this.props.displayedIntervals }
					onUpgradeClick={ ( cartItems ) => this.onSelectPlan( cartItems ) }
					customerType={ this.getCustomerType() }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain } // TODO clk investigate
					deemphasizeFreePlan={ deemphasizeFreePlan }
					plansWithScroll={ this.state.isDesktop }
					intent={ intent }
					flowName={ flowName }
					hideFreePlan={ hideFreePlan }
					hidePersonalPlan={ this.props.hidePersonalPlan }
					hidePremiumPlan={ this.props.hidePremiumPlan }
					hideEcommercePlan={ this.shouldHideEcommercePlan() }
					hideEnterprisePlan={ this.props.hideEnterprisePlan }
					removePaidDomain={ this.removePaidDomain }
					setSiteUrlAsFreeDomainSuggestion={ this.setSiteUrlAsFreeDomainSuggestion }
					coupon={ coupon }
					showPlanTypeSelectorDropdown={ config.isEnabled( 'onboarding/interval-dropdown' ) }
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
		const { headerText, translate } = this.props;

		if ( headerText ) {
			return headerText;
		}

		return translate( 'Choose your flavor of WordPress' );
	}

	getSubHeaderText() {
		const { translate, useEmailOnboardingSubheader } = this.props;

		const freePlanButton = (
			<Button onClick={ () => buildUpgradeFunction( this.props, null ) } borderless />
		);

		if ( useEmailOnboardingSubheader ) {
			return translate(
				'Add more features to your professional website with a plan. Or {{link}}start with email and a free site{{/link}}.',
				{ components: { link: freePlanButton } }
			);
		}
	}

	shouldHideEcommercePlan() {
		// The flow with the Site Assembler step doesn't support atomic site, so we have to hide the plan.
		// We also hide the plan if the flag is set - currently it's only set for the `site-selected` flow.
		return isSiteAssemblerFlow( this.props.flowName ) || this.props.hideEcommercePlan;
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
			backLabelText = translate( 'Back to sites' );
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

				// During onboarding, if the user chooses to use their own domain, but that domain needs to have
				// its ownership verified, they can skip the domain selection step and the `domainItem` dependency
				// is not provided. In that case, the "Back" button in the plan selection step needs to go back to
				// the initial domain selection step and not to the "transfer or connect" step.
				if (
					( 'onboarding' === flowName || 'onboarding-pm' === flowName ) &&
					undefined === previousStep?.providedDependencies?.domainItem
				) {
					backUrl = getStepUrl( flowName, 'domains' );
				}
			}
		}

		return (
			<>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					shouldHideNavButtons={ this.props.shouldHideNavButtons }
					fallbackHeaderText={ fallbackHeaderText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ false }
					isExtraWideLayout
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
		const classes = clsx( 'plans plans-step', {
			'has-no-sidebar': true,
			'is-wide-layout': false,
			'is-extra-wide-layout': true,
		} );

		return (
			<>
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
	flowName: PropTypes.string,
	intent: PropTypes.oneOf( [
		'plans-blog-onboarding',
		'plans-newsletter',
		'plans-link-in-bio',
		'plans-new-hosted-site',
		'plans-plugins',
		'plans-jetpack-app',
		'plans-import',
		'default',
	] ),
};

/**
 * Checks if the domainItem picked in the domain step is a top level .blog domain -
 * we only want to make Blogger plan available if it is.
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
	( state, { path, signupDependencies: { siteSlug, domainItem } } ) => ( {
		// Blogger plan is only available if user chose either a free domain or a .blog domain registration
		disableBloggerPlanWithNonBlogDomain:
			domainItem && ! isSubdomain( domainItem.meta ) && ! isDotBlogDomainRegistration( domainItem ),
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		customerType: parseQs( path.split( '?' ).pop() ).customerType,
		hasInitializedSitesBackUrl: getCurrentUserSiteCount( state ) ? '/sites/' : false,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep, errorNotice }
)( localize( PlansStep ) );
