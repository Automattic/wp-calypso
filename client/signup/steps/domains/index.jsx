import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { VIDEOPRESS_FLOW, isWithThemeFlow, isHostingSignupFlow } from '@automattic/onboarding';
import { isTailoredSignupFlow } from '@automattic/onboarding/src';
import { withShoppingCart } from '@automattic/shopping-cart';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { defer, get, isEmpty } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import Notice from 'calypso/components/notice';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import {
	domainRegistration,
	domainMapping,
	domainTransfer,
	getDomainRegistrations,
	updatePrivacyForDomain,
	hasDomainInCart,
} from 'calypso/lib/cart-values/cart-items';
import {
	getDomainProductSlug,
	getDomainSuggestionSearch,
	getFixedDomainSearch,
} from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { getSitePropertyDefaults } from 'calypso/lib/signup/site-properties';
import { maybeExcludeEmailsStep } from 'calypso/lib/signup/step-actions';
import wpcom from 'calypso/lib/wp';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl, isPlanSelectionAvailableLaterInFlow } from 'calypso/signup/utils';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'calypso/state/domains/actions';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { fetchUsernameSuggestion } from 'calypso/state/signup/optional-dependencies/actions';
import {
	removeStep,
	saveSignupStep,
	submitSignupStep,
} from 'calypso/state/signup/progress/actions';
import { isPlanStepExistsAndSkipped } from 'calypso/state/signup/progress/selectors';
import { setDesignType } from 'calypso/state/signup/steps/design-type/actions';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getExternalBackUrl } from './utils';

import './style.scss';

export class RenderDomainsStep extends Component {
	static propTypes = {
		cart: PropTypes.object,
		shoppingCartManager: PropTypes.any,
		forceDesignType: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		flowName: PropTypes.string.isRequired,
		goToNextStep: PropTypes.func.isRequired,
		isDomainOnly: PropTypes.bool.isRequired,
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		queryObject: PropTypes.object,
		step: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		stepSectionName: PropTypes.string,
		selectedSite: PropTypes.object,
		isReskinned: PropTypes.bool,
	};

	constructor( props ) {
		super( props );

		const domain = get( props, 'queryObject.new', false );
		const search = get( props, 'queryObject.search', false ) === 'yes';
		const suggestedDomain = get( props, 'signupDependencies.suggestedDomain' );

		// If we landed anew from `/domains` and it's the `new-flow` variation
		// or there's a suggestedDomain from previous steps, always rerun the search.
		if ( ( search && props.path.indexOf( '?' ) !== -1 ) || suggestedDomain ) {
			this.searchOnInitialRender = true;
		}

		if (
			props.isDomainOnly &&
			domain &&
			! search && // Testing /domains sending to NUX for search
			// If someone has a better idea on how to figure if the user landed anew
			// Because we persist the signupDependencies, but still want the user to be able to go back to search screen
			props.path.indexOf( '?' ) !== -1
		) {
			this.skipRender = true;
			const productSlug = getDomainProductSlug( domain );
			const domainItem = domainRegistration( { productSlug, domain } );
			const domainCart = this.shouldUseMultipleDomainsInCart()
				? getDomainRegistrations( this.props.cart )
				: {};

			props.submitSignupStep(
				{
					stepName: props.stepName,
					domainItem,
					siteUrl: domain,
					isPurchasingItem: true,
					stepSectionName: props.stepSectionName,
					domainCart,
				},
				{
					domainItem,
					siteUrl: domain,
					domainCart,
				}
			);

			props.goToNextStep();
		}
		this.setCurrentFlowStep = this.setCurrentFlowStep.bind( this );
		this.state = {
			currentStep: null,
			isCartPendingUpdateDomain: null,
		};
	}

	componentDidMount() {
		if ( isTailoredSignupFlow( this.props.flowName ) ) {
			// trigger guides on this step, we don't care about failures or response
			wpcom.req.post(
				'guides/trigger',
				{
					apiNamespace: 'wpcom/v2/',
				},
				{
					flow: this.props.flowName,
					step: 'domains',
				}
			);
		}

		// the A/A tests for identifying SRM issue. See peP6yB-11Y-p2
		if ( this.props.flowName === 'onboarding' ) {
			loadExperimentAssignment( 'calypso_srm_test_domain_page_view_free_plan_button_click' );
			loadExperimentAssignment( 'calypso_srm_test_domain_page_view_free_plan_modal_view' );
		}
	}

	getLocale() {
		return ! this.props.userLoggedIn ? this.props.locale : '';
	}

	getUseYourDomainUrl = () => {
		return getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.getLocale()
		);
	};

	handleAddDomain = ( suggestion, position ) => {
		const signupDomainOrigin = suggestion?.is_free
			? SIGNUP_DOMAIN_ORIGIN.FREE
			: SIGNUP_DOMAIN_ORIGIN.CUSTOM;

		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		this.setState( { isCartPendingUpdateDomain: suggestion } );
		this.props.recordAddDomainButtonClick(
			suggestion.domain_name,
			this.getAnalyticsSection(),
			position,
			suggestion?.is_premium
		);
		this.props.saveSignupStep( stepData );

		defer( () => {
			this.submitWithDomain( { signupDomainOrigin, position } );
		} );
	};

	isPurchasingTheme = () => {
		return this.props.queryObject && this.props.queryObject.premium;
	};

	getThemeSlug = () => {
		return this.props.queryObject ? this.props.queryObject.theme : undefined;
	};

	getThemeStyleVariation = () => {
		return this.props.queryObject ? this.props.queryObject.style_variation : undefined;
	};

	getThemeArgs = () => {
		const themeSlug = this.getThemeSlug();
		const themeStyleVariation = this.getThemeStyleVariation();
		const themeSlugWithRepo = this.getThemeSlugWithRepo( themeSlug );

		return { themeSlug, themeSlugWithRepo, themeStyleVariation };
	};

	getThemeSlugWithRepo = ( themeSlug ) => {
		if ( ! themeSlug ) {
			return undefined;
		}
		const repo = this.isPurchasingTheme() ? 'premium' : 'pub';
		return `${ repo }/${ themeSlug }`;
	};

	shouldUseThemeAnnotation() {
		return this.getThemeSlug() ? true : false;
	}

	isDependencyShouldHideFreePlanProvided = () => {
		/**
		 * This prop is used to supress providing the dependency - shouldHideFreePlan - when the plans step is in the current flow
		 */
		return (
			! this.props.forceHideFreeDomainExplainerAndStrikeoutUi &&
			this.props.isPlanSelectionAvailableLaterInFlow
		);
	};

	handleSkip = ( googleAppsCartItem, shouldHideFreePlan = false, signupDomainOrigin ) => {
		const tracksProperties = Object.assign(
			{
				section: this.getAnalyticsSection(),
				flow: this.props.flowName,
				step: this.props.stepName,
			},
			this.isDependencyShouldHideFreePlanProvided()
				? { should_hide_free_plan: shouldHideFreePlan }
				: {}
		);

		this.props.recordTracksEvent( 'calypso_signup_skip_step', tracksProperties );

		const stepData = {
			stepName: this.props.stepName,
			suggestion: undefined,
			domainCart: {},
		};

		this.props.saveSignupStep( stepData );

		defer( () => {
			this.submitWithDomain( { googleAppsCartItem, shouldHideFreePlan, signupDomainOrigin } );
		} );
	};

	handleDomainExplainerClick = () => {
		const hideFreePlan = true;
		this.handleSkip( undefined, hideFreePlan, SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER );
	};

	handleUseYourDomainClick = () => {
		page( this.getUseYourDomainUrl() );
		this.props.recordUseYourDomainButtonClick( this.getAnalyticsSection() );
	};

	handleDomainToDomainCart = () => {
		const { step } = this.props;

		const { suggestion } = step;
		const isPurchasingItem = suggestion && Boolean( suggestion.product_slug );
		const siteUrl =
			suggestion &&
			( isPurchasingItem
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ) );

		if ( hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.removeDomain( suggestion );
		} else {
			this.addDomain( suggestion );
			this.props.setDesignType( this.getDesignType() );
			// Start the username suggestion process.
			siteUrl && this.props.fetchUsernameSuggestion( siteUrl.split( '.' )[ 0 ] );
		}
	};

	shouldUseMultipleDomainsInCart = () => {
		const { step, flowName } = this.props;
		if ( ! step ) {
			return;
		}
		const { suggestion } = step;

		const enabledFlows = [ 'onboarding' ];

		return (
			isEnabled( 'domains/add-multiple-domains-to-cart' ) &&
			enabledFlows.includes( flowName ) &&
			( ! suggestion || ( suggestion && ! suggestion.is_free ) )
		);
	};

	submitWithDomain = ( { googleAppsCartItem, shouldHideFreePlan = false, signupDomainOrigin } ) => {
		const { step } = this.props;
		const { suggestion } = step;

		if ( this.shouldUseMultipleDomainsInCart() ) {
			return this.handleDomainToDomainCart( {
				googleAppsCartItem,
				shouldHideFreePlan,
				signupDomainOrigin,
			} );
		}
		const { flowName } = this.props;
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		const { lastDomainSearched } = step.domainForm ?? {};

		const isPurchasingItem = suggestion && Boolean( suggestion.product_slug );

		const siteUrl =
			suggestion &&
			( isPurchasingItem
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ) );

		const domainItem = isPurchasingItem
			? domainRegistration( {
					domain: suggestion.domain_name,
					productSlug: suggestion.product_slug,
			  } )
			: undefined;

		switch ( flowName ) {
			case 'onboarding':
				if ( isPurchasingItem ) {
					loadExperimentAssignment(
						'calypso_onboarding_plans_paid_domain_on_free_plan_confidence_check'
					);

					// the A/A tests for identifying SRM issue. See peP6yB-11Y-p2
					loadExperimentAssignment( 'calypso_srm_test_paid_domain_click_free_plan_button_click' );
					loadExperimentAssignment( 'calypso_srm_test_paid_domain_click_free_plan_modal_view' );
				} else {
					loadExperimentAssignment(
						'calypso_gf_signup_onboarding_free_free_dont_miss_out_modal_v3'
					);
				}
				break;
			case 'onboarding-pm':
				if ( isPurchasingItem ) {
					loadExperimentAssignment( 'calypso_onboardingpm_plans_paid_domain_on_free_plan' );
				} else {
					loadExperimentAssignment(
						'calypso_gf_signup_onboarding_pm_free_free_dont_miss_out_modal_v3'
					);
				}
		}

		suggestion && this.props.submitDomainStepSelection( suggestion, this.getAnalyticsSection() );

		maybeExcludeEmailsStep( {
			domainItem,
			resetSignupStep: this.props.removeStep,
			siteUrl: suggestion?.domain_name,
			stepName: 'emails',
			submitSignupStep: this.props.submitSignupStep,
		} );

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					domainItem,
					googleAppsCartItem,
					isPurchasingItem,
					siteUrl,
					stepSectionName: this.props.stepSectionName,
					domainCart: {},
				},
				this.getThemeArgs()
			),
			Object.assign(
				{ domainItem },
				this.isDependencyShouldHideFreePlanProvided() ? { shouldHideFreePlan } : {},
				useThemeHeadstartItem,
				signupDomainOrigin ? { signupDomainOrigin } : {},
				suggestion?.domain_name ? { siteUrl: suggestion?.domain_name } : {},
				lastDomainSearched ? { lastDomainSearched } : {},
				{ domainCart: {} }
			)
		);

		this.props.setDesignType( this.getDesignType() );
		this.props.goToNextStep();

		// Start the username suggestion process.
		siteUrl && this.props.fetchUsernameSuggestion( siteUrl.split( '.' )[ 0 ] );
	};

	handleAddMapping = ( { sectionName, domain, state } ) => {
		const domainItem = domainMapping( { domain } );
		const isPurchasingItem = true;
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		this.props.recordAddDomainButtonClickInMapDomain( domain, this.getAnalyticsSection() );

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					[ sectionName ]: state,
					domainItem,
					isPurchasingItem,
					siteUrl: domain,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			Object.assign(
				{ domainItem },
				useThemeHeadstartItem,
				{
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN,
				},
				{ siteUrl: domain }
			)
		);

		this.props.goToNextStep();
	};

	handleAddTransfer = ( { domain, authCode } ) => {
		const domainItem = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );
		const isPurchasingItem = true;
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		this.props.recordAddDomainButtonClickInTransferDomain( domain, this.getAnalyticsSection() );

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					transfer: {},
					domainItem,
					isPurchasingItem,
					siteUrl: domain,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			Object.assign( { domainItem }, useThemeHeadstartItem, { siteUrl: domain } )
		);

		this.props.goToNextStep();
	};

	handleSave = ( sectionName, state ) => {
		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			stepSectionName: this.props.stepSectionName,
			[ sectionName ]: state,
		} );
	};

	getDesignType = () => {
		if ( this.props.forceDesignType ) {
			return this.props.forceDesignType;
		}

		if ( this.props.signupDependencies && this.props.signupDependencies.designType ) {
			return this.props.signupDependencies.designType;
		}

		return this.props.designType;
	};

	shouldIncludeDotBlogSubdomain() {
		const { flowName, isDomainOnly } = this.props;

		// 'subdomain' flow coming from .blog landing pages
		if ( flowName === 'subdomain' ) {
			return true;
		}

		// 'blog' flow, starting with blog themes
		if ( flowName === 'blog' ) {
			return true;
		}

		// No .blog subdomains for domain only sites
		if ( isDomainOnly ) {
			return false;
		}

		const lastQuery = get( this.props.step, 'domainForm.lastQuery' );
		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
	}

	shouldHideDomainExplainer = () => {
		const { flowName } = this.props;
		return [
			'free',
			'personal',
			'personal-monthly',
			'premium',
			'premium-monthly',
			'business',
			'business-monthly',
			'ecommerce',
			'ecommerce-monthly',
			'domain',
		].includes( flowName );
	};

	shouldHideUseYourDomain = () => {
		const { flowName } = this.props;
		return [ 'domain' ].includes( flowName );
	};

	shouldDisplayDomainOnlyExplainer = () => {
		const { flowName } = this.props;
		return [ 'domain' ].includes( flowName );
	};

	async addDomain( suggestion ) {
		const {
			domain_name: domain,
			product_slug: productSlug,
			supports_privacy: supportsPrivacy,
		} = suggestion;

		let registration = domainRegistration( {
			domain,
			productSlug,
			extra: { privacy_available: supportsPrivacy },
		} );

		if ( supportsPrivacy ) {
			registration = updatePrivacyForDomain( registration, true );
		}

		await this.props.shoppingCartManager.addProductsToCart( [ registration ] ).then( () => {
			this.setState( { isCartPendingUpdateDomain: null } );
		} );
	}

	removeDomainClickHandler = ( domain ) => {
		return () =>
			this.removeDomain( { domain_name: domain.meta, product_slug: domain.product_slug } );
	};

	removeDomain( { domain_name, product_slug } ) {
		const productToRemove = this.props.cart.products.find(
			( product ) => product.meta === domain_name && product.product_slug === product_slug
		);
		if ( productToRemove ) {
			this.setState( { isCartPendingUpdateDomain: { domain_name: domain_name } } );
			const uuidToRemove = productToRemove.uuid;
			this.props.shoppingCartManager
				.removeProductFromCart( uuidToRemove )
				.then( () => {
					this.setState( { isCartPendingUpdateDomain: null } );
				} )
				.catch( () => {
					this.setState( { isCartPendingUpdateDomain: null } );
				} );
		}
	}

	goToNext = () => {
		return () => {
			const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
			const useThemeHeadstartItem = shouldUseThemeAnnotation
				? { useThemeHeadstart: shouldUseThemeAnnotation }
				: {};

			const { step } = this.props;
			const { lastDomainSearched } = step.domainForm ?? {};

			const { suggestion } = step;
			const isPurchasingItem = suggestion && Boolean( suggestion.product_slug );
			const siteUrl =
				suggestion &&
				( isPurchasingItem
					? suggestion.domain_name
					: suggestion.domain_name.replace( '.wordpress.com', '' ) );

			const domainItem = isPurchasingItem
				? domainRegistration( {
						domain: suggestion.domain_name,
						productSlug: suggestion.product_slug,
				  } )
				: undefined;
			const domainCart = getDomainRegistrations( this.props.cart );
			this.props.submitSignupStep(
				Object.assign(
					{
						stepName: this.props.stepName,
						domainItem,
						isPurchasingItem,
						siteUrl,
						stepSectionName: this.props.stepSectionName,
						domainCart,
					},
					this.getThemeArgs()
				),
				Object.assign(
					{ domainItem, domainCart },
					useThemeHeadstartItem,
					suggestion?.domain_name ? { siteUrl: suggestion?.domain_name } : {},
					lastDomainSearched ? { lastDomainSearched } : {},
					{ domainCart }
				)
			);
			this.props.goToNextStep();
		};
	};

	getSideContent = () => {
		const { translate } = this.props;
		const domainsInCart = this.shouldUseMultipleDomainsInCart()
			? getDomainRegistrations( this.props.cart )
			: [];
		const cartIsLoading = this.props.shoppingCartManager.isLoading;

		const useYourDomain = ! this.shouldHideUseYourDomain() ? (
			<div className="domains__domain-side-content">
				<ReskinSideExplainer onClick={ this.handleUseYourDomainClick } type="use-your-domain" />
			</div>
		) : null;

		const BoldTLD = ( { domain } ) => {
			const tld = domain.split( '.' ).pop();
			return (
				<>
					<span>{ domain.replace( `.${ tld }`, '' ) }</span>
					<b>.{ tld }</b>
				</>
			);
		};

		const DomainNameAndCost = ( { domain } ) => {
			const priceText = translate( '%(cost)s/year', {
				args: { cost: domain.item_original_cost_display },
			} );
			const costDifference = domain.item_original_cost - domain.cost;
			const hasPromotion = costDifference > 0;

			return (
				<>
					<div>
						<div
							className={ classNames( 'domains__domain-cart-domain', {
								'limit-width': hasPromotion,
							} ) }
						>
							<BoldTLD domain={ domain.meta } data={ domain } />
						</div>
						<div className="domain-product-price__price">
							{ hasPromotion && <del>{ priceText }</del> }
							<span className="domains__price">{ domain.item_subtotal_display }</span>
						</div>
					</div>
					<div>
						<Button
							borderless
							className="domains__domain-cart-remove"
							onClick={ this.removeDomainClickHandler( domain ) }
						>
							{ this.props.translate( 'Remove' ) }
						</Button>
						{ hasPromotion && (
							<span className="savings-message">
								{ translate( 'Up to %(costDifference)s off for a domain.', {
									args: { costDifference: formatCurrency( costDifference, domain.currency ) },
								} ) }
							</span>
						) }
					</div>
				</>
			);
		};

		const DomainsInCart =
			this.shouldUseMultipleDomainsInCart() && ! cartIsLoading ? (
				<div className="domains__domain-side-content domains__domain-cart">
					<div className="domains__domain-cart-title">
						{ this.props.translate( 'Your domains' ) }
					</div>
					<div className="domains__domain-cart-rows">
						{ domainsInCart.map( ( domain, i ) => (
							<div key={ `row${ i }` } className="domains__domain-cart-row">
								<DomainNameAndCost domain={ domain } />
							</div>
						) ) }
					</div>
					<div key="rowtotal" className="domains__domain-cart-total">
						{ this.props.translate( '%d domain', '%d domains', {
							count: domainsInCart.length,
							args: [ domainsInCart.length ],
						} ) }
					</div>
					<Button primary className="domains__domain-cart-continue" onClick={ this.goToNext() }>
						{ this.props.translate( 'Continue' ) }
					</Button>
					<Button
						borderless
						className="domains__domain-cart-choose-later"
						onClick={ this.handleUseYourDomainClick }
					>
						{ this.props.translate( 'Choose my domain later' ) }
					</Button>
				</div>
			) : null;

		return (
			<div className="domains__domain-side-content-container">
				{ domainsInCart.length > 0
					? DomainsInCart
					: ! this.shouldHideDomainExplainer() &&
					  this.props.isPlanSelectionAvailableLaterInFlow && (
							<div className="domains__domain-side-content domains__free-domain">
								<ReskinSideExplainer
									onClick={ this.handleDomainExplainerClick }
									type="free-domain-explainer"
									flowName={ this.props.flowName }
								/>
							</div>
					  ) }
				{ useYourDomain }
				{ this.shouldDisplayDomainOnlyExplainer() && (
					<div className="domains__domain-side-content">
						<ReskinSideExplainer
							onClick={ this.handleDomainExplainerClick }
							type="free-domain-only-explainer"
						/>
					</div>
				) }
			</div>
		);
	};

	domainForm = () => {
		const initialState = this.props.step?.domainForm ?? {};

		// If it's the first load, rerun the search with whatever we get from the query param or signup dependencies.
		const initialQuery =
			get( this.props, 'queryObject.new', '' ) ||
			get( this.props, 'signupDependencies.suggestedDomain' );

		// Search using the initial query but do not show the query on the search input field.
		const hideInitialQuery = get( this.props, 'queryObject.hide_initial_query', false ) === 'yes';
		initialState.hideInitialQuery = hideInitialQuery;

		if (
			// If we landed here from /domains Search or with a suggested domain.
			initialQuery &&
			this.searchOnInitialRender
		) {
			this.searchOnInitialRender = false;
			if ( initialState ) {
				initialState.searchResults = null;
				initialState.subdomainSearchResults = null;
				// If length is less than 2 it will not fetch any data.
				// filter before counting length
				initialState.loadingResults =
					getDomainSuggestionSearch( getFixedDomainSearch( initialQuery ) ).length >= 2;
			}
		}

		let showExampleSuggestions = this.props.showExampleSuggestions;
		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		const includeWordPressDotCom = this.props.includeWordPressDotCom ?? ! this.props.isDomainOnly;
		const promoTlds = this.props?.queryObject?.tld?.split( ',' ) ?? null;

		return (
			<RegisterDomainStep
				key="domainForm"
				path={ this.props.path }
				initialState={ initialState }
				onAddDomain={ this.handleAddDomain }
				isCartPendingUpdate={ this.props.shoppingCartManager.isPendingUpdate }
				isCartPendingUpdateDomain={ this.state.isCartPendingUpdateDomain }
				products={ this.props.productsList }
				basePath={ this.props.path }
				promoTlds={ promoTlds }
				mapDomainUrl={ this.getUseYourDomainUrl() }
				otherManagedSubdomains={ this.props.otherManagedSubdomains }
				otherManagedSubdomainsCountOverride={ this.props.otherManagedSubdomainsCountOverride }
				transferDomainUrl={ this.getUseYourDomainUrl() }
				useYourDomainUrl={ this.getUseYourDomainUrl() }
				onAddMapping={ this.handleAddMapping.bind( this, { sectionName: 'domainForm' } ) }
				onSave={ this.handleSave.bind( this, 'domainForm' ) }
				offerUnavailableOption={ ! this.props.isDomainOnly }
				isDomainOnly={ this.props.isDomainOnly }
				analyticsSection={ this.getAnalyticsSection() }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				includeWordPressDotCom={ includeWordPressDotCom }
				includeDotBlogSubdomain={ this.shouldIncludeDotBlogSubdomain() }
				isSignupStep
				isPlanSelectionAvailableInFlow={ this.props.isPlanSelectionAvailableLaterInFlow }
				showExampleSuggestions={ showExampleSuggestions }
				suggestion={ initialQuery }
				designType={ this.getDesignType() }
				vendor={ getSuggestionsVendor( {
					isSignup: true,
					isDomainOnly: this.props.isDomainOnly,
					flowName: this.props.flowName,
				} ) }
				deemphasiseTlds={ this.props.flowName === 'ecommerce' ? [ 'blog' ] : [] }
				selectedSite={ this.props.selectedSite }
				showSkipButton={ this.props.showSkipButton }
				onSkip={ this.handleSkip }
				hideFreePlan={ this.handleSkip }
				forceHideFreeDomainExplainerAndStrikeoutUi={
					this.props.forceHideFreeDomainExplainerAndStrikeoutUi
				}
				isReskinned={ this.props.isReskinned }
				reskinSideContent={ this.getSideContent() }
				isInLaunchFlow={ 'launch-site' === this.props.flowName }
				promptText={
					this.isHostingFlow()
						? this.props.translate( 'Stand out with a short and memorable domain' )
						: undefined
				}
			/>
		);
	};

	onUseMyDomainConnect = ( { domain } ) => {
		this.handleAddMapping( { sectionName: 'useYourDomainForm', domain } );
	};

	insertUrlParams( params ) {
		if ( history.pushState ) {
			const searchParams = new URLSearchParams( window.location.search );

			Object.entries( params ).forEach( ( [ key, value ] ) => searchParams.set( key, value ) );
			const newUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				window.location.pathname +
				'?' +
				decodeURIComponent( searchParams.toString() );
			window.history.pushState( { path: newUrl }, '', newUrl );
		}
	}

	setCurrentFlowStep( { mode, domain } ) {
		this.setState( { currentStep: mode }, () => {
			this.insertUrlParams( { step: this.state.currentStep, initialQuery: domain } );
		} );
	}

	useYourDomainForm = () => {
		const queryObject = parse( window.location.search.replace( '?', '' ) );
		const initialQuery = get( this.props.step, 'domainForm.lastQuery' ) || queryObject.initialQuery;

		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<UseMyDomain
					analyticsSection={ this.getAnalyticsSection() }
					basePath={ this.props.path }
					initialQuery={ initialQuery }
					initialMode={ queryObject.step ?? inputMode.domainInput }
					onNextStep={ this.setCurrentFlowStep }
					isSignupStep
					showHeader={ false }
					onTransfer={ this.handleAddTransfer }
					onConnect={ this.onUseMyDomainConnect }
					onSkip={ () => this.handleSkip( undefined, false ) }
				/>
			</div>
		);
	};

	isHostingFlow = () => isHostingSignupFlow( this.props.flowName );

	getSubHeaderText() {
		const { flowName, isAllDomains, stepSectionName, isReskinned, translate } = this.props;

		if ( isAllDomains ) {
			return translate( 'Find the domain that defines you' );
		}

		if ( VIDEOPRESS_FLOW === flowName ) {
			const components = {
				span: (
					// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
					<span
						role="button"
						className="tailored-flow-subtitle__cta-text"
						onClick={ () => this.handleSkip() }
					/>
				),
			};

			return translate(
				'Set your video site apart with a custom domain. Not sure yet? {{span}}Decide later{{/span}}.',
				{ components }
			);
		}

		if ( this.isHostingFlow() ) {
			const components = {
				span: (
					<button
						className="tailored-flow-subtitle__cta-text"
						style={ { fontWeight: 500, fontSize: '1em', display: 'inline' } }
						onClick={ () => this.handleSkip( undefined, true ) }
					/>
				),
			};

			return translate(
				'Find the perfect domain for your exciting new project or {{span}}decide later{{/span}}.',
				{ components }
			);
		}

		if ( isReskinned ) {
			return (
				! stepSectionName &&
				'domain-transfer' !== this.props.flowName &&
				translate( 'Enter some descriptive keywords to get started' )
			);
		}

		return 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName
			? translate( 'Use a domain you already own with your new WordPress.com site.' )
			: translate( "Enter your site's name or some keywords that describe it to get started." );
	}

	getHeaderText() {
		const { headerText, isAllDomains, isReskinned, stepSectionName, translate } = this.props;

		if ( stepSectionName === 'use-your-domain' || 'domain-transfer' === this.props.flowName ) {
			return '';
		}

		if ( headerText ) {
			return headerText;
		}

		if ( isAllDomains ) {
			return translate( 'Your next big idea starts here' );
		}

		if ( isReskinned ) {
			return ! stepSectionName && translate( 'Choose a domain' );
		}

		return getSitePropertyDefaults( 'signUpFlowDomainsStepHeader' );
	}

	getAnalyticsSection() {
		return this.props.isDomainOnly ? 'domain-first' : 'signup';
	}

	isTailoredFlow() {
		return VIDEOPRESS_FLOW === this.props.flowName;
	}

	shouldHideNavButtons() {
		return isWithThemeFlow( this.props.flowName ) || this.isTailoredFlow();
	}

	renderContent() {
		let content;
		let sideContent;

		if ( 'use-your-domain' === this.props.stepSectionName ) {
			content = this.useYourDomainForm();
		}

		if ( ! this.props.stepSectionName || this.props.isDomainOnly ) {
			content = this.domainForm();
		}

		if ( ! this.props.stepSectionName && this.props.isReskinned && ! this.isTailoredFlow() ) {
			sideContent = this.getSideContent();
		}

		if ( 'domain-transfer' === this.props.flowName && ! this.props.stepSectionName ) {
			content = this.useYourDomainForm();
			sideContent = null;
		}

		if ( this.props.step && 'invalid' === this.props.step.status ) {
			content = (
				<div className="domains__step-section-wrapper">
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
					{ content }
				</div>
			);
		}

		return (
			<div
				key={ this.props.step + this.props.stepSectionName }
				className="domains__step-content domains__step-content-domain-step"
			>
				{ content }
				{ sideContent }
			</div>
		);
	}

	getPreviousStepUrl() {
		if (
			'use-your-domain' !== this.props.stepSectionName &&
			'domain-transfer' !== this.props.flowName
		) {
			return null;
		}

		const { step, ...queryValues } = parse( window.location.search.replace( '?', '' ) );
		const currentStep = step ?? this.state?.currentStep;

		let mode = inputMode.domainInput;
		switch ( currentStep ) {
			case null:
			case inputMode.domainInput:
				return null;

			case inputMode.transferOrConnect:
				mode = inputMode.domainInput;
				break;

			case inputMode.transferDomain:
			case inputMode.ownershipVerification:
				mode = inputMode.transferOrConnect;
				break;
		}
		return getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.getLocale(),
			{
				step: mode,
				...queryValues,
			}
		);
	}

	removeQueryParam( url ) {
		return url.split( '?' )[ 0 ];
	}

	render() {
		if ( this.skipRender ) {
			return null;
		}

		const { isAllDomains, translate, isReskinned, userSiteCount } = this.props;
		const siteUrl = this.props.selectedSite?.URL;
		const siteSlug = this.props.queryObject?.siteSlug;
		const source = this.props.queryObject?.source;
		let backUrl;
		let backLabelText;
		let isExternalBackUrl = false;

		const previousStepBackUrl = this.getPreviousStepUrl();
		const [ sitesBackLabelText, defaultBackUrl ] =
			userSiteCount && userSiteCount === 1
				? [ translate( 'Back to My Home' ), '/home' ]
				: [ translate( 'Back to sites' ), '/sites' ];

		if ( previousStepBackUrl ) {
			backUrl = previousStepBackUrl;
		} else if ( isAllDomains ) {
			backUrl = domainManagementRoot();
			backLabelText = translate( 'Back to All Domains' );
		} else if ( ! previousStepBackUrl && 'domain-transfer' === this.props.flowName ) {
			backUrl = null;
			backLabelText = null;
		} else {
			backUrl = getStepUrl( this.props.flowName, this.props.stepName, null, this.getLocale() );

			if ( 'site' === source && siteUrl ) {
				backUrl = siteUrl;
				backLabelText = translate( 'Back to My Site' );
				isExternalBackUrl = true;
			} else if ( 'my-home' === source && siteSlug ) {
				backUrl = `/home/${ siteSlug }`;
				backLabelText = translate( 'Back to My Home' );
			} else if ( 'general-settings' === source && siteSlug ) {
				backUrl = `/settings/general/${ siteSlug }`;
				backLabelText = translate( 'Back to General Settings' );
			} else if ( backUrl === this.removeQueryParam( this.props.path ) ) {
				backUrl = defaultBackUrl;
				backLabelText = sitesBackLabelText;
			}

			const externalBackUrl = getExternalBackUrl( source, this.props.stepSectionName );
			if ( externalBackUrl ) {
				backUrl = externalBackUrl;
				backLabelText = translate( 'Back' );
				// Solves route conflicts between LP and calypso (ex. /domains).
				isExternalBackUrl = true;
			}
		}

		const headerText = this.getHeaderText();
		const fallbackSubHeaderText = this.getSubHeaderText();

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				headerText={ headerText }
				subHeaderText={ fallbackSubHeaderText }
				isExternalBackUrl={ isExternalBackUrl }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				shouldHideNavButtons={ this.shouldHideNavButtons() }
				stepContent={
					<div>
						<QueryProductsList />
						{ this.renderContent() }
					</div>
				}
				allowBackFirstStep={ !! backUrl }
				backLabelText={ backLabelText }
				hideSkip={ true }
				goToNextStep={ this.handleSkip }
				align={ isReskinned ? 'left' : 'center' }
				isWideLayout={ isReskinned }
			/>
		);
	}
}

const submitDomainStepSelection = ( suggestion, section ) => {
	let domainType = 'domain_reg';
	if ( suggestion.is_free ) {
		domainType = 'wpcom_subdomain';
		if ( suggestion.domain_name.endsWith( '.blog' ) ) {
			domainType = 'dotblog_subdomain';
		}
	}

	const tracksObjects = {
		domain_name: suggestion.domain_name,
		section,
		type: domainType,
	};
	if ( suggestion.isRecommended ) {
		tracksObjects.label = 'recommended';
	}
	if ( suggestion.isBestAlternative ) {
		tracksObjects.label = 'best-alternative';
	}

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			`Submitted Domain Selection for a ${ domainType } on a Domain Registration`,
			'Domain Name',
			suggestion.domain_name
		),
		recordTracksEvent( 'calypso_domain_search_submit_step', tracksObjects )
	);
};

const RenderDomainsStepConnect = connect(
	( state, { steps, flowName } ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const isPlanStepSkipped = isPlanStepExistsAndSkipped( state );
		const selectedSite = getSelectedSite( state );
		const eligibleForProPlan = isEligibleForProPlan( state, selectedSite?.ID );

		return {
			designType: getDesignType( state ),
			productsList,
			productsLoaded,
			selectedSite,
			sites: getSitesItems( state ),
			userSiteCount: getCurrentUserSiteCount( state ),
			isPlanSelectionAvailableLaterInFlow:
				( ! isPlanStepSkipped && isPlanSelectionAvailableLaterInFlow( steps ) ) ||
				[ 'pro', 'starter' ].includes( flowName ),
			userLoggedIn: isUserLoggedIn( state ),
			eligibleForProPlan,
		};
	},
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		recordUseYourDomainButtonClick,
		removeStep,
		submitDomainStepSelection,
		setDesignType,
		saveSignupStep,
		submitSignupStep,
		recordTracksEvent,
		fetchUsernameSuggestion,
	}
)( withCartKey( withShoppingCart( localize( RenderDomainsStep ) ) ) );

export default function DomainsStep( props ) {
	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainsStepConnect { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
