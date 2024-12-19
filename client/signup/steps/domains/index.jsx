import { PLAN_PERSONAL } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Spinner } from '@automattic/components';
import {
	isWithThemeFlow,
	isHostingSignupFlow,
	isOnboardingGuidedFlow,
	isOnboardingFlow,
} from '@automattic/onboarding';
import { isTailoredSignupFlow } from '@automattic/onboarding/src';
import { withShoppingCart } from '@automattic/shopping-cart';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { defer, get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import FormattedHeader from 'calypso/components/formatted-header';
import Notice from 'calypso/components/notice';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import {
	domainRegistration,
	domainMapping,
	domainTransfer,
	updatePrivacyForDomain,
	planItem,
	hasPlan,
	hasDomainRegistration,
	getDomainsInCart,
} from 'calypso/lib/cart-values/cart-items';
import {
	getDomainProductSlug,
	getDomainSuggestionSearch,
	getFixedDomainSearch,
} from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { getSitePropertyDefaults } from 'calypso/lib/signup/site-properties';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import {
	getStepUrl,
	isPlanSelectionAvailableLaterInFlow,
	getPreviousStepName,
} from 'calypso/signup/utils';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import {
	getCurrentUser,
	getCurrentUserSiteCount,
	isUserLoggedIn,
} from 'calypso/state/current-user/selectors';
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
import DomainsMiniCart from './domains-mini-cart';
import { getExternalBackUrl, shouldUseMultipleDomainsInCart } from './utils';
import './style.scss';

export class RenderDomainsStep extends Component {
	static propTypes = {
		cart: PropTypes.object,
		shoppingCartManager: PropTypes.any,
		forceDesignType: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		flowName: PropTypes.string.isRequired,
		goToNextStep: PropTypes.func.isRequired,
		goBack: PropTypes.func,
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
		recordTracksEvent: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		const domain = get( props, 'queryObject.new', false );
		const search = get( props, 'queryObject.search', false ) === 'yes';
		const suggestedDomain = get( props, 'signupDependencies.suggestedDomain' );
		const siteUrl = get( props, 'signupDependencies.siteUrl' );

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
			const domainCart = shouldUseMultipleDomainsInCart( props.flowName )
				? getDomainsInCart( this.props.cart )
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
			wpcomSubdomainSelected:
				siteUrl && siteUrl.indexOf( '.wordpress.com' ) !== -1 ? { domain_name: siteUrl } : null,
			domainRemovalQueue: [],
			isMiniCartContinueButtonBusy: false,
			temporaryCart: [],
			replaceDomainFailedMessage: null,
			domainAddingQueue: [],
			domainsWithMappingError: [],
			checkDomainAvailabilityPromises: [],
			removeDomainTimeout: 0,
			addDomainTimeout: 0,
		};
	}

	componentDidMount() {
		if ( isTailoredSignupFlow( this.props.flowName ) ) {
			triggerGuidesForStep( this.props.flowName, 'domains' );
		}

		// We add a plan to cart on Multi Domains to show the proper discount on the mini-cart.
		if (
			shouldUseMultipleDomainsInCart( this.props.flowName ) &&
			hasDomainRegistration( this.props.cart )
		) {
			// This call is expensive, so we only do it if the mini-cart hasDomainRegistration.
			this.props.shoppingCartManager.addProductsToCart( [ this.props.multiDomainDefaultPlan ] );
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

	handleAddDomain = async ( suggestion, position, previousState ) => {
		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		const signupDomainOrigin = suggestion?.is_free
			? SIGNUP_DOMAIN_ORIGIN.FREE
			: SIGNUP_DOMAIN_ORIGIN.CUSTOM;

		if ( shouldUseMultipleDomainsInCart( this.props.flowName ) ) {
			const domainInAddingQueue = this.state.domainAddingQueue.find(
				( item ) => item.meta === suggestion.domain_name
			);

			const domainInRemovalQueue = this.state.domainRemovalQueue.find(
				( item ) => item.meta === suggestion.domain_name
			);

			if ( domainInAddingQueue || domainInRemovalQueue ) {
				// return false;
			}
		} else {
			this.setState( { isCartPendingUpdateDomain: suggestion } );
		}

		this.props.recordAddDomainButtonClick(
			suggestion.domain_name,
			this.getAnalyticsSection(),
			position,
			suggestion?.is_premium
		);

		await this.props.saveSignupStep( stepData );

		if (
			shouldUseMultipleDomainsInCart( this.props.flowName ) &&
			suggestion?.isSubDomainSuggestion
		) {
			if ( this.state.wpcomSubdomainSelected ) {
				this.freeDomainRemoveClickHandler();
			} else {
				this.setState( { wpcomSubdomainSelected: suggestion } );
				this.props.saveSignupStep( stepData );
			}

			return;
		}

		if ( shouldUseMultipleDomainsInCart( this.props.flowName ) && suggestion ) {
			await this.handleDomainToDomainCart( previousState );

			// If we already have a free selection in place, let's enforce that as a free site suggestion
			if ( this.state.wpcomSubdomainSelected ) {
				await this.props.saveSignupStep( {
					stepName: this.props.stepName,
					suggestion: this.state.wpcomSubdomainSelected,
				} );
			}
		} else {
			await this.submitWithDomain( { signupDomainOrigin, position } );
		}
	};

	handleDomainMappingError = async ( domain_name ) => {
		this.state.domainsWithMappingError.push( domain_name );
		const productToRemove = this.props.cart.products.find(
			( product ) => product.meta === domain_name
		);

		if ( productToRemove ) {
			this.setState( ( prevState ) => ( {
				domainRemovalQueue: [
					...prevState.domainRemovalQueue,
					{ meta: productToRemove.meta, productSlug: productToRemove.product_slug },
				],
			} ) );
			this.setState( { isMiniCartContinueButtonBusy: true } );
			await this.removeDomain( { domain_name, product_slug: productToRemove.product_slug } );
			this.setState( { isMiniCartContinueButtonBusy: false } );
		} else if ( this.state.temporaryCart?.length > 0 ) {
			this.setState( ( state ) => ( {
				temporaryCart: state.temporaryCart.filter( ( domain ) => domain.meta !== domain_name ),
			} ) );
		}
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
		// Stepper doesn't support page.js
		const navigate = this.props.page || page;
		this.props.recordUseYourDomainButtonClick( this.getAnalyticsSection() );
		if ( this.props.useStepperWrapper ) {
			this.props.goToNextStep( { navigateToUseMyDomain: true } );
		} else {
			navigate( this.getUseYourDomainUrl() );
		}
	};

	handleDomainToDomainCart = async ( previousState ) => {
		const { suggestion } = this.props.step;

		if ( previousState ) {
			await this.removeDomain( suggestion );
		} else {
			await this.addDomain( suggestion );
			this.props.setDesignType( this.getDesignType() );
		}
	};

	submitWithDomain = ( { googleAppsCartItem, shouldHideFreePlan = false, signupDomainOrigin } ) => {
		const { step } = this.props;
		const { suggestion } = step;

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

		suggestion && this.props.submitDomainStepSelection( suggestion, this.getAnalyticsSection() );

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

		// For the `domain-for-gravatar` flow, add an extra `is_gravatar_domain` property to the domain registration product,
		// pre-select the "domain" choice in the "site or domain" step and skip the others, going straight to checkout
		if ( this.props.flowName === 'domain-for-gravatar' ) {
			const domainForGravatarItem = domainRegistration( {
				domain: suggestion.domain_name,
				productSlug: suggestion.product_slug,
				extra: {
					is_gravatar_domain: true,
				},
			} );

			this.props.submitSignupStep(
				{
					stepName: 'site-or-domain',
					domainItem: domainForGravatarItem,
					designType: 'domain',
					siteSlug: domainForGravatarItem.meta,
					siteUrl,
					isPurchasingItem: true,
				},
				{ designType: 'domain', domainItem: domainForGravatarItem, siteUrl }
			);
			this.props.submitSignupStep(
				{ stepName: 'site-picker', wasSkipped: true },
				{ themeSlugWithRepo: 'pub/twentysixteen' }
			);
			return;
		}

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
					domainCart: {},
				},
				this.getThemeArgs()
			),
			Object.assign(
				{ domainItem },
				useThemeHeadstartItem,
				{
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN,
				},
				{ siteUrl: domain },
				{ domainCart: {} }
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
					domainCart: {},
				},
				this.getThemeArgs()
			),
			Object.assign(
				{ domainItem },
				useThemeHeadstartItem,
				{ siteUrl: domain },
				{ domainCart: {} }
			)
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

		// No .blog subdomains for domain only sites
		if ( isDomainOnly ) {
			return false;
		}

		const lastQuery = get( this.props.step, 'domainForm.lastQuery' );
		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
	}

	shouldHideDomainExplainer = () => {
		const { flowName } = this.props;
		return [ 'domain', 'domain-for-gravatar', 'onboarding-with-email' ].includes( flowName );
	};

	shouldHideUseYourDomain = () => {
		const { flowName } = this.props;
		return [ 'domain', 'domain-for-gravatar', 'onboarding-with-email' ].includes( flowName );
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

		// Add item_subtotal_integer property to registration, so it can be sorted by price.
		registration.item_subtotal_integer = ( suggestion.sale_cost ?? suggestion.raw_price ) * 100;

		if ( shouldUseMultipleDomainsInCart( this.props.flowName ) ) {
			this.setState( { isMiniCartContinueButtonBusy: true } );
			if (
				! this.state.temporaryCart ||
				! this.state.temporaryCart.some(
					( domainInCart ) => domainInCart.meta === suggestion.domain_name
				)
			) {
				this.setState( ( state ) => ( {
					isCartPendingUpdateDomain: { domain_name: suggestion.domain_name },
					temporaryCart: [
						...( state.temporaryCart || [] ),
						{
							meta: suggestion.domain_name,
							temporary: true,
						},
					],
				} ) );
			}

			await this.setState( ( prevState ) => ( {
				domainAddingQueue: [ ...prevState.domainAddingQueue, registration ],
			} ) );

			// We add a plan to cart on Multi Domains to show the proper discount on the mini-cart.
			// TODO: remove productsToAdd
			const productsToAdd = ! hasPlan( this.props.cart )
				? [ registration, this.props.multiDomainDefaultPlan ]
				: [ registration ];

			// Replace the products in the cart with the freshly sorted products.
			clearTimeout( this.state.addDomainTimeout );

			// Avoid too much API calls for Multi-domains flow
			this.state.addDomainTimeout = setTimeout( async () => {
				// Only saves after all domain are checked.
				Promise.all( this.state.checkDomainAvailabilityPromises ).then( async () => {
					if ( this.props.currentUser ) {
						await this.props.shoppingCartManager.reloadFromServer();
					}

					// Add productsToAdd to productsInCart.
					let productsInCart = [
						...this.props.cart.products,
						...productsToAdd,
						...this.state.domainAddingQueue,
					];
					// Remove domains with domainsWithMappingError from productsInCart.
					productsInCart = productsInCart.filter( ( product ) => {
						return ! this.state.domainsWithMappingError.includes( product.meta );
					} );
					// Sort products to ensure the user gets the best deal with the free domain bundle promotion.
					const sortedProducts = this.sortProductsByPriceDescending( productsInCart );
					this.props.shoppingCartManager
						.replaceProductsInCart( sortedProducts )
						.then( () => {
							this.setState( { replaceDomainFailedMessage: null } );
							if ( this.state.domainAddingQueue?.length > 0 ) {
								this.setState( ( state ) => ( {
									domainAddingQueue: state.domainAddingQueue.filter(
										( domainInQueue ) =>
											! sortedProducts.find( ( item ) => item.meta === domainInQueue.meta )
									),
								} ) );
							}
							if ( this.state.temporaryCart?.length > 0 ) {
								this.setState( ( state ) => ( {
									temporaryCart: state.temporaryCart.filter(
										( temporaryCart ) =>
											! sortedProducts.find( ( item ) => item.meta === temporaryCart.meta )
									),
								} ) );
							}
						} )
						.catch( () => {
							this.handleReplaceProductsInCartError(
								this.props.translate(
									'Sorry, there was a problem adding that domain. Please try again later.'
								)
							);
						} );
					this.setState( { isMiniCartContinueButtonBusy: false } );
				} );
			}, 500 );
		} else {
			await this.props.shoppingCartManager.addProductsToCart( registration );
		}

		this.setState( { isCartPendingUpdateDomain: null } );
	}

	sortProductsByPriceDescending( productsInCart ) {
		// Sort products by price descending, considering promotions.
		const getSortingValue = ( product ) => {
			if ( product.item_subtotal_integer !== 0 ) {
				return product.item_subtotal_integer;
			}

			// Use the lowest non-zero new_price or fallback to item_original_cost_integer.
			const nonZeroPrices =
				product.cost_overrides
					?.map( ( override ) => override.new_price * 100 )
					.filter( ( price ) => price > 0 ) || [];

			return nonZeroPrices.length
				? Math.min( ...nonZeroPrices )
				: product.item_original_cost_integer;
		};

		return productsInCart.sort( ( a, b ) => {
			return getSortingValue( b ) - getSortingValue( a );
		} );
	}

	removeDomainClickHandler = ( domain ) => async () => {
		await this.removeDomain( {
			domain_name: domain.meta,
			product_slug: domain.product_slug,
		} );
	};

	async removeDomain( { domain_name, product_slug } ) {
		if ( this.state.temporaryCart?.length > 0 ) {
			this.setState( ( state ) => ( {
				temporaryCart: state.temporaryCart.filter( ( domain ) => domain.meta !== domain_name ),
			} ) );
		}

		// check if the domain is alreay in the domainRemovalQueue queue
		if ( ! this.state.domainRemovalQueue.find( ( domain ) => domain.meta === domain_name ) ) {
			this.setState( ( prevState ) => ( {
				isMiniCartContinueButtonBusy: true,
				domainRemovalQueue: [
					...prevState.domainRemovalQueue,
					{ meta: domain_name, productSlug: product_slug },
				],
			} ) );
		}

		this.setState( { isCartPendingUpdateDomain: { domain_name: domain_name } } );
		clearTimeout( this.state.removeDomainTimeout );

		// Avoid too much API calls for Multi-domains flow
		this.state.removeDomainTimeout = setTimeout( async () => {
			if ( this.props.currentUser ) {
				await this.props.shoppingCartManager.reloadFromServer();
			}

			const productsToKeep = this.props.cart.products.filter( ( product ) => {
				// check current item
				if ( product.meta === domain_name && product.product_slug === product_slug ) {
					// this is to be removed
					return false;
				}
				// check removal queue
				return ! this.state.domainRemovalQueue.find(
					( domain ) => product.meta === domain.meta && product.product_slug === domain.productSlug
				);
			} );

			await this.props.shoppingCartManager
				.replaceProductsInCart( productsToKeep )
				.then( () => {
					this.setState( { replaceDomainFailedMessage: null } );
				} )
				.catch( () => {
					this.handleReplaceProductsInCartError(
						this.props.translate(
							'Sorry, there was a problem removing that domain. Please try again later.'
						)
					);
				} )
				.finally( () => {
					if ( this.state.domainRemovalQueue?.length > 0 ) {
						this.setState( ( state ) => ( {
							domainRemovalQueue: state.domainRemovalQueue.filter( ( domainInQueue ) =>
								productsToKeep.find( ( item ) => item.meta === domainInQueue.meta )
							),
						} ) );
					}
				} );
			this.setState( { isMiniCartContinueButtonBusy: false } );
		}, 500 );
	}

	handleReplaceProductsInCartError = ( errorMessage ) => {
		const errors = this.props.shoppingCartManager.responseCart.messages?.errors;
		if ( errors && errors.length === 0 ) {
			this.setState( {
				replaceDomainFailedMessage: errorMessage,
			} );
		}
		this.setState( () => ( { temporaryCart: [] } ) );
		this.props.shoppingCartManager.reloadFromServer();
	};

	goToNext = ( event ) => {
		event.stopPropagation();
		this.setState( { isMiniCartContinueButtonBusy: true } );
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		const { step, cart, multiDomainDefaultPlan, shoppingCartManager, goToNextStep } = this.props;
		const { lastDomainSearched } = step.domainForm ?? {};

		const domainCart = getDomainsInCart( this.props.cart );
		const { suggestion } = step;
		const isPurchasingItem =
			( suggestion && Boolean( suggestion.product_slug ) ) || domainCart?.length > 0;
		const siteUrl =
			suggestion &&
			// If we have a free domain in the cart, we want to use it as the siteUrl
			( isPurchasingItem && ! this.state.wpcomSubdomainSelected
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ) );

		let domainItem;

		if ( isPurchasingItem ) {
			const selectedDomain = domainCart?.length > 0 ? domainCart[ 0 ] : suggestion;
			domainItem = domainRegistration( {
				domain: selectedDomain?.domain_name || selectedDomain?.meta,
				productSlug: selectedDomain?.product_slug,
			} );
		}

		const signupDomainOrigin = isPurchasingItem
			? SIGNUP_DOMAIN_ORIGIN.CUSTOM
			: SIGNUP_DOMAIN_ORIGIN.FREE;

		const stepDependencies = Object.assign(
			{
				stepName: this.props.stepName,
				domainItem,
				isPurchasingItem,
				siteUrl,
				stepSectionName: this.props.stepSectionName,
				domainCart,
			},
			this.getThemeArgs()
		);
		const providedDependencies = Object.assign(
			{ domainItem, domainCart },
			useThemeHeadstartItem,
			signupDomainOrigin ? { signupDomainOrigin } : {},
			{ siteUrl: suggestion?.domain_name },
			lastDomainSearched ? { lastDomainSearched } : {},
			{ domainCart }
		);
		this.props.submitSignupStep( stepDependencies, providedDependencies );

		const productToRemove = cart.products.find(
			( product ) => product.product_slug === multiDomainDefaultPlan.product_slug
		);

		if ( productToRemove && productToRemove.uuid ) {
			shoppingCartManager.removeProductFromCart( productToRemove.uuid ).then( () => {
				goToNextStep();
			} );
		} else {
			goToNextStep();
		}
	};

	freeDomainRemoveClickHandler = () => {
		this.setState( { wpcomSubdomainSelected: false } );
		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			suggestion: {
				domain_name: false,
			},
		} );
	};

	getSideContent = () => {
		const { flowName } = this.props;
		const domainsInCart = getDomainsInCart( this.props.cart );

		const additionalDomains = this.state.temporaryCart
			.map( ( cartDomain ) => {
				return domainsInCart.find( ( domain ) => domain.meta === cartDomain.meta )
					? null
					: cartDomain;
			} )
			.filter( Boolean );

		if ( additionalDomains.length > 0 ) {
			domainsInCart.push( ...additionalDomains );
		}

		const cartIsLoading = this.props.shoppingCartManager.isLoading;

		const useYourDomain = ! this.shouldHideUseYourDomain() ? (
			<div
				className={ clsx( 'domains__domain-side-content', {
					'fade-out':
						shouldUseMultipleDomainsInCart( flowName ) &&
						( domainsInCart.length > 0 || this.state.wpcomSubdomainSelected ),
				} ) }
			>
				<ReskinSideExplainer onClick={ this.handleUseYourDomainClick } type="use-your-domain" />
			</div>
		) : null;

		const hasSearchedDomains = Array.isArray( this.props.step?.domainForm?.searchResults );

		return (
			<div className="domains__domain-side-content-container">
				{ domainsInCart.length > 0 || this.state.wpcomSubdomainSelected ? (
					<DomainsMiniCart
						domainsInCart={ domainsInCart }
						temporaryCart={ this.state.temporaryCart }
						domainRemovalQueue={ this.state.domainRemovalQueue }
						cartIsLoading={ cartIsLoading }
						flowName={ flowName }
						removeDomainClickHandler={ this.removeDomainClickHandler }
						isMiniCartContinueButtonBusy={ this.state.isMiniCartContinueButtonBusy }
						goToNext={ this.goToNext }
						handleSkip={ this.handleSkip }
						wpcomSubdomainSelected={ this.state.wpcomSubdomainSelected }
						freeDomainRemoveClickHandler={ this.freeDomainRemoveClickHandler }
					/>
				) : (
					! this.shouldHideDomainExplainer() &&
					hasSearchedDomains && (
						<div className="domains__domain-side-content domains__free-domain">
							<ReskinSideExplainer
								onClick={ this.handleDomainExplainerClick }
								type={
									this.props.isPlanSelectionAvailableLaterInFlow
										? 'free-domain-explainer-check-paid-plans'
										: 'free-domain-explainer'
								}
								flowName={ flowName }
							/>
						</div>
					)
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
				onMappingError={ this.handleDomainMappingError }
				checkDomainAvailabilityPromises={ this.state.checkDomainAvailabilityPromises }
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
				includeOwnedDomainInSuggestions={ ! this.props.isDomainOnly }
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
				wpcomSubdomainSelected={ this.state.wpcomSubdomainSelected }
				temporaryCart={ this.state.temporaryCart }
				domainRemovalQueue={ this.state.domainRemovalQueue }
				forceExactSuggestion={ this.props?.queryObject?.source === 'general-settings' }
				replaceDomainFailedMessage={ this.state.replaceDomainFailedMessage }
				dismissReplaceDomainFailed={ this.dismissReplaceDomainFailed }
			/>
		);
	};

	dismissReplaceDomainFailed = () => {
		this.setState( { replaceDomainFailedMessage: null } );
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

		if (
			shouldUseMultipleDomainsInCart( flowName ) &&
			! [ 'use-your-domain' ].includes( stepSectionName )
		) {
			return translate( 'Find and claim one or more domain names' );
		}

		if ( isReskinned ) {
			return (
				! stepSectionName &&
				'domain-transfer' !== flowName &&
				translate( 'Enter some descriptive keywords to get started' )
			);
		}

		return 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName
			? translate( 'Use a domain you already own with your new WordPress.com site.' )
			: translate( "Enter your site's name or some keywords that describe it to get started." );
	}

	getHeaderText() {
		const { headerText, isAllDomains, isReskinned, stepSectionName, translate, flowName } =
			this.props;

		if ( stepSectionName === 'use-your-domain' || 'domain-transfer' === flowName ) {
			return '';
		}

		if ( headerText ) {
			return headerText;
		}

		if ( isAllDomains ) {
			return translate( 'Your next big idea starts here' );
		}

		if ( isReskinned ) {
			if ( shouldUseMultipleDomainsInCart( flowName ) ) {
				return ! stepSectionName && translate( 'Choose your domains' );
			}
			return ! stepSectionName && translate( 'Choose a domain' );
		}

		return getSitePropertyDefaults( 'signUpFlowDomainsStepHeader' );
	}

	getAnalyticsSection() {
		return this.props.isDomainOnly ? 'domain-first' : 'signup';
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

		if ( ! this.props.stepSectionName && this.props.isReskinned ) {
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
			<div className="domains__step-content domains__step-content-domain-step">
				{ this.props.isSideContentExperimentLoading ? (
					<Spinner width="100" />
				) : (
					<>
						{ content }
						{ sideContent }
					</>
				) }
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

		const {
			flowName,
			stepName,
			stepSectionName,
			isAllDomains,
			translate,
			isReskinned,
			userSiteCount,
			previousStepName,
			useStepperWrapper,
			goBack,
		} = this.props;
		const siteUrl = this.props.selectedSite?.URL;
		const siteSlug = this.props.queryObject?.siteSlug;
		const source = this.props.queryObject?.source;
		let backUrl;
		let backLabelText;
		let isExternalBackUrl = false;

		/**
		 * Hide "Back" button in domains step if:
		 *   1. The user has no sites
		 *   2. This step was rendered immediately after account creation
		 *   3. The user is on the root domains step and not a child step section like use-your-domain
		 */
		const shouldHideBack =
			! userSiteCount &&
			previousStepName?.startsWith( 'user' ) &&
			stepSectionName !== 'use-your-domain' &&
			! ( isOnboardingFlow( flowName ) && !! goBack );

		const hideBack = flowName === 'domain' || shouldHideBack;

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
		} else if ( ! previousStepBackUrl && 'domain-transfer' === flowName ) {
			backUrl = null;
			backLabelText = null;
		} else if ( 'domain-for-gravatar' === flowName ) {
			backUrl = null;
			backLabelText = null;
		} else if ( 'with-plugin' === flowName ) {
			backUrl = '/plugins';
			backLabelText = translate( 'Back to plugins' );
		} else if ( isWithThemeFlow( flowName ) ) {
			backUrl = '/themes';
			backLabelText = translate( 'Back to themes' );
		} else if ( 'plans-first' === flowName ) {
			backUrl = getStepUrl( flowName, previousStepName );
		} else if ( isOnboardingGuidedFlow( flowName ) ) {
			// Let the framework decide the back url.
			backUrl = undefined;
		} else if ( isOnboardingFlow( flowName ) && !! goBack ) {
			backUrl = null;
			backLabelText = translate( 'Back' );
		} else {
			backUrl = getStepUrl( flowName, stepName, null, this.getLocale() );

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

			const externalBackUrl = getExternalBackUrl( source, stepSectionName );
			if ( externalBackUrl ) {
				backUrl = externalBackUrl;
				backLabelText = translate( 'Back' );
				// Solves route conflicts between LP and calypso (ex. /domains).
				isExternalBackUrl = true;
			}
		}

		const headerText = this.getHeaderText();
		const fallbackSubHeaderText = this.getSubHeaderText();

		if ( useStepperWrapper ) {
			return (
				<AsyncLoad
					require="@automattic/onboarding/src/step-container"
					hideBack={ hideBack }
					flowName={ flowName }
					stepName={ stepName }
					backUrl={ backUrl }
					isExternalBackUrl={ isExternalBackUrl }
					shouldHideNavButtons={ false }
					stepContent={
						<div>
							<QueryProductsList type="domains" />
							{ this.renderContent() }
						</div>
					}
					formattedHeader={
						<FormattedHeader
							id="domains-header"
							align="center"
							subHeaderAlign="center"
							headerText={ headerText }
							subHeaderText={ fallbackSubHeaderText }
						/>
					}
					backLabelText={ backLabelText }
					hideSkip
					align="center"
					isWideLayout
					goBack={ goBack }
					recordTracksEvent={ this.props.recordTracksEvent }
				/>
			);
		}

		return (
			<AsyncLoad
				require="calypso/signup/step-wrapper"
				hideBack={ hideBack }
				flowName={ flowName }
				stepName={ stepName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				headerText={ headerText }
				subHeaderText={ fallbackSubHeaderText }
				isExternalBackUrl={ isExternalBackUrl }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				shouldHideNavButtons={ false }
				stepContent={
					<div>
						<QueryProductsList type="domains" />
						{ this.renderContent() }
					</div>
				}
				allowBackFirstStep={ !! backUrl }
				backLabelText={ backLabelText }
				hideSkip
				goToNextStep={ this.handleSkip }
				align="center"
				isWideLayout={ isReskinned }
			/>
		);
	}
}

export const submitDomainStepSelection = ( suggestion, section ) => {
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
	( state, { steps, flowName, stepName, previousStepName } ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const isPlanStepSkipped = isPlanStepExistsAndSkipped( state );
		const selectedSite = getSelectedSite( state );
		const multiDomainDefaultPlan = planItem( PLAN_PERSONAL );
		const userLoggedIn = isUserLoggedIn( state );

		return {
			designType: getDesignType( state ),
			currentUser: getCurrentUser( state ),
			productsList,
			productsLoaded,
			selectedSite,
			sites: getSitesItems( state ),
			userSiteCount: getCurrentUserSiteCount( state ),
			isPlanSelectionAvailableLaterInFlow:
				( ! isPlanStepSkipped && isPlanSelectionAvailableLaterInFlow( steps ) ) ||
				[ 'pro', 'starter' ].includes( flowName ),
			userLoggedIn,
			multiDomainDefaultPlan,
			previousStepName: previousStepName || getPreviousStepName( flowName, stepName, userLoggedIn ),
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
	// this is kept since there will likely be more experiments to come.
	// See peP6yB-1Np-p2
	const isSideContentExperimentLoading = false;

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainsStepConnect
				{ ...props }
				isSideContentExperimentLoading={ isSideContentExperimentLoading }
			/>
		</CalypsoShoppingCartProvider>
	);
}
