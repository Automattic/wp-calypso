import { isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { BackButton, ECOMMERCE_FLOW } from '@automattic/onboarding';
import { UseShoppingCart, withShoppingCart } from '@automattic/shopping-cart';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import {
	hasPlan,
	hasDomainInCart,
	domainTransfer,
	domainRegistration,
	updatePrivacyForDomain,
	ObjectWithProducts,
} from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { addQueryArgs } from 'calypso/lib/url';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import DomainAndPlanPackageNavigation from 'calypso/my-sites/domains/components/domain-and-plan-package/navigation';
import NewDomainsRedirectionNoticeUpsell from 'calypso/my-sites/domains/domain-management/components/domain/new-domains-redirection-notice-upsell';
import {
	domainAddEmailUpsell,
	domainManagementList,
	domainUseMyDomain,
} from 'calypso/my-sites/domains/paths';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordRemoveDomainButtonClick,
} from 'calypso/state/domains/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isSiteOnMonthlyPlan from 'calypso/state/selectors/is-site-on-monthly-plan';
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import { setCurrentFlowName } from 'calypso/state/signup/flow/actions';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	isSiteOnECommerceTrial,
	isSiteOnWooExpress,
	isSiteOnEcommerce,
} from 'calypso/state/sites/plans/selectors';
import { getSiteAdminUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import type { Context } from '@automattic/calypso-router';
import type { DomainSuggestion, SiteDetails } from '@automattic/data-stores';

import './style.scss';
import 'calypso/my-sites/domains/style.scss';

type DomainSearchProps = {
	basePath: string;
	context: Context;
	domainsWithPlansOnly: boolean;
	isSiteUpgradeable: boolean | null;
	productsList: object;
	selectedSite?: SiteDetails | null;
	selectedSiteId?: number;
	selectedSiteSlug: string | null;
	domainAndPlanUpsellFlow?: boolean;
	isDomainAndPlanPackageFlow?: boolean;
	cart: ObjectWithProducts;
	shoppingCartManager: UseShoppingCart;
	isAddNewDomainContext: boolean;
	setCurrentFlowName: ( flowName: string ) => void;
	recordAddDomainButtonClick: (
		domainName: string,
		section: string,
		position: number,
		isPremium?: boolean,
		flowName?: string
	) => void;
	recordRemoveDomainButtonClick: ( domainName: string ) => void;
	isSiteOnFreePlan?: boolean;
	isSiteOnMonthlyPlan: boolean;
	isDomainUpsell: boolean;
	currentRoute: string;
	isFromMyHome: boolean;
	translate: ReturnType< typeof useTranslate >;
	isManagingAllDomains: boolean;
	isEcommerceSite: boolean;
	preferredView: ReturnType< typeof getSiteOption >;
	wpAdminUrl: ReturnType< typeof getSiteAdminUrl >;
};

class DomainSearch extends Component< DomainSearchProps > {
	isMounted = false;

	state = {
		domainRegistrationAvailable: true,
		domainRegistrationMaintenanceEndTime: null,
	};

	handleDomainsAvailabilityChange = (
		isAvailable: boolean,
		maintenanceEndTime: number | null = null
	) => {
		this.setState( {
			domainRegistrationAvailable: isAvailable,
			domainRegistrationMaintenanceEndTime: maintenanceEndTime,
		} );
	};

	handleAddRemoveDomain = ( suggestion: DomainSuggestion, position: number ) => {
		if ( ! hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.addDomain( suggestion, position );
		} else {
			this.removeDomain( suggestion );
		}
	};

	handleAddMapping = ( domain: string ) => {
		// Just a TS typing fix, we always have selectedSiteSlug
		if ( ! this.props.selectedSiteSlug ) {
			return;
		}
		const domainMappingUrl = domainUseMyDomain( this.props.selectedSiteSlug, {
			domain,
			initialMode: useMyDomainInputMode.transferOrConnect,
		} );
		this.isMounted && page( domainMappingUrl );
	};

	handleAddTransfer = async ( domain: string ) => {
		try {
			await this.props.shoppingCartManager.addProductsToCart( [ domainTransfer( { domain } ) ] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return;
		}
		this.isMounted && page( '/checkout/' + this.props.selectedSiteSlug );
	};

	componentDidMount() {
		if ( this.props.isDomainAndPlanPackageFlow ) {
			document.body.classList.add( 'is-domain-plan-package-flow' );
		}
		this.checkSiteIsUpgradeable();
		if ( this.props.isAddNewDomainContext ) {
			this.props.setCurrentFlowName( 'domains' );
		}

		this.isMounted = true;
	}

	componentDidUpdate( prevProps: DomainSearchProps ) {
		if ( prevProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable();
		}
		if (
			this.props.isDomainAndPlanPackageFlow &&
			! document.body.classList.contains( 'is-domain-plan-package-flow' )
		) {
			document.body.classList.add( 'is-domain-plan-package-flow' );
		}
		if (
			! this.props.isDomainAndPlanPackageFlow &&
			document.body.classList.contains( 'is-domain-plan-package-flow' )
		) {
			document.body.classList.remove( 'is-domain-plan-package-flow' );
		}
	}

	componentWillUnmount() {
		if ( document.body.classList.contains( 'is-domain-plan-package-flow' ) ) {
			document.body.classList.remove( 'is-domain-plan-package-flow' );
		}

		this.isMounted = false;
	}

	checkSiteIsUpgradeable() {
		if ( this.props.selectedSite && ! this.props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	async addDomain( suggestion: DomainSuggestion, position: number ) {
		const {
			domain_name: domain,
			product_slug: productSlug,
			supports_privacy: supportsPrivacy,
			is_premium: isPremium,
		} = suggestion;

		this.props.recordAddDomainButtonClick( domain, 'domains', position, isPremium, 'domains/add' );

		let registration = domainRegistration( {
			domain,
			productSlug: productSlug as string,
			extra: { privacy_available: supportsPrivacy },
		} );

		if ( supportsPrivacy ) {
			registration = updatePrivacyForDomain( registration, true );
		}

		if ( this.props.domainAndPlanUpsellFlow ) {
			try {
				// If we are in the domain + annual plan upsell flow, we need to redirect
				// to the plans page next and let it know that we are still in that flow.
				await this.props.shoppingCartManager.addProductsToCart( [ registration ] );
			} catch {
				// Nothing needs to be done here. CartMessages will display the error to the user.
				return;
			}
			// Monthly plans don't have free domains
			const intervalTypePath = this.props.isSiteOnMonthlyPlan ? 'yearly/' : '';
			const nextStepLink =
				! this.props.isSiteOnFreePlan && ! this.props.isSiteOnMonthlyPlan
					? `/checkout/${ this.props.selectedSiteSlug }`
					: addQueryArgs(
							{
								domainAndPlanPackage: true,
								domain: this.props.isDomainUpsell ? domain : undefined,
							},
							`/plans/${ intervalTypePath }${ this.props.selectedSiteSlug }`
					  );
			page( nextStepLink );
			return;
		}

		try {
			await this.props.shoppingCartManager.addProductsToCart( [ registration ] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return;
		}
		page( domainAddEmailUpsell( this.props.selectedSiteSlug, domain ) );
	}

	removeDomain( suggestion: DomainSuggestion ) {
		this.props.recordRemoveDomainButtonClick( suggestion.domain_name );

		const productToRemove = this.props.cart.products.find(
			( product ) =>
				product.meta === suggestion.domain_name && product.product_slug === suggestion.product_slug
		);
		if ( productToRemove ) {
			const uuidToRemove = productToRemove.uuid;
			this.props.shoppingCartManager.removeProductFromCart( uuidToRemove ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
		}
	}

	getInitialSuggestion() {
		const { context, selectedSite } = this.props;
		if ( context.query.suggestion ) {
			return context.query.suggestion;
		}

		const wpcomSubdomainWithRandomNumberSuffix = /^(.+?)([0-9]{5,})\.wordpress\.com$/i;
		const [ , strippedHostname ] =
			selectedSite?.domain.match( wpcomSubdomainWithRandomNumberSuffix ) || [];
		return strippedHostname ?? selectedSite?.domain.split( '.' )[ 0 ];
	}

	getBackButtonHref() {
		const {
			context: { query },
			selectedSiteSlug,
			currentRoute,
			isFromMyHome,
		} = this.props;

		// If we have the from query param, we should use that as the back button href
		if ( isFromMyHome ) {
			return `/home/${ selectedSiteSlug }`;
		} else if ( query?.redirect_to ) {
			return query.redirect_to;
		}

		return domainManagementList( selectedSiteSlug ?? undefined, currentRoute );
	}

	render() {
		const {
			selectedSite,
			selectedSiteSlug,
			selectedSiteId,
			translate,
			isManagingAllDomains,
			cart,
			isDomainAndPlanPackageFlow,
			isDomainUpsell,
			isEcommerceSite,
		} = this.props;

		if ( ! selectedSite || ! selectedSiteId ) {
			return null;
		}

		const classes = clsx( 'main-column', {
			'domain-search-page-wrapper': this.state.domainRegistrationAvailable,
		} );
		const { domainRegistrationMaintenanceEndTime } = this.state;

		const hasPlanInCart = hasPlan( cart );
		const hrefForDecideLater = addQueryArgs(
			{
				domainAndPlanPackage: true,
			},
			`/plans/yearly/${ selectedSiteSlug }`
		);

		let content;

		const launchpadScreen = this.props.selectedSite?.options?.launchpad_screen;
		const siteIntent = this.props.selectedSite?.options?.site_intent;

		if ( ! this.state.domainRegistrationAvailable ) {
			let maintenanceEndTime = translate( 'shortly', {
				comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
			} );
			if ( domainRegistrationMaintenanceEndTime ) {
				maintenanceEndTime = moment.unix( domainRegistrationMaintenanceEndTime ).fromNow();
			}

			content = (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate( 'Domain registration is unavailable' ) }
					line={ translate( "We're hard at work on the issue. Please check back %(timePeriod)s.", {
						args: {
							timePeriod: maintenanceEndTime,
						},
					} ) }
					action={ translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSiteSlug }
				/>
			);
		} else {
			const goBackButtonProps =
				launchpadScreen === 'full'
					? {
							goBackText: translate( 'Next Steps' ),
							goBackLink: `/setup/${ siteIntent }/launchpad?siteSlug=${ selectedSiteSlug }`,
					  }
					: {
							goBackLink:
								this.props.preferredView === 'wp-admin' && !! this.props.wpAdminUrl
									? this.props.wpAdminUrl
									: `/home/${ selectedSiteSlug }`,
					  };
			content = (
				<span>
					<div className="domain-search__content">
						{ ! isDomainAndPlanPackageFlow && (
							<BackButton className="domain-search__go-back" href={ this.getBackButtonHref() }>
								<Gridicon icon="arrow-left" size={ 18 } />
								{ translate( 'Back' ) }
							</BackButton>
						) }

						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<div className="domains__header">
							{ isDomainAndPlanPackageFlow && (
								<>
									<DomainAndPlanPackageNavigation
										{ ...goBackButtonProps }
										hidePlansPage={
											! this.props.isSiteOnFreePlan && ! this.props.isSiteOnMonthlyPlan
										}
										step={ 1 }
									/>
									<FormattedHeader
										brandFont
										headerText={ translate( 'Claim your domain' ) }
										align="center"
									/>

									<p>
										{ translate(
											'Stake your claim on your corner of the web with a custom domain name that’s easy to find, share, and follow.'
										) }
										{ ! isDomainUpsell && (
											<>
												{ ' ' }
												{ translate( 'Not sure yet?' ) }
												<a className="domains__header-decide-later" href={ hrefForDecideLater }>
													{ translate( 'Decide later.' ) }
												</a>
											</>
										) }
									</p>
								</>
							) }

							{ ! isDomainAndPlanPackageFlow && (
								<FormattedHeader
									brandFont
									headerText={
										isManagingAllDomains
											? translate( 'All Domains' )
											: translate( 'Search for a domain' )
									}
									align="left"
								/>
							) }
						</div>

						<EmailVerificationGate
							noticeText={ translate( 'You must verify your email to register new domains.' ) }
							noticeStatus="is-info"
						>
							{ ! hasPlanInCart && ! this.props.domainAndPlanUpsellFlow && (
								<NewDomainsRedirectionNoticeUpsell />
							) }
							<RegisterDomainStep
								suggestion={ this.getInitialSuggestion() }
								domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
								domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
								onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
								onAddDomain={ this.handleAddRemoveDomain }
								onAddMapping={ this.handleAddMapping }
								onAddTransfer={ this.handleAddTransfer }
								isCartPendingUpdate={ this.props.shoppingCartManager.isPendingUpdate }
								showAlreadyOwnADomain
								selectedSite={ selectedSite }
								basePath={ this.props.basePath }
								products={ this.props.productsList }
								vendor={ getSuggestionsVendor( {
									flowName: isEcommerceSite ? ECOMMERCE_FLOW : '',
								} ) }
							/>
						</EmailVerificationGate>
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes } wideLayout>
				<QueryProductsList />
				<QuerySiteDomains siteId={ selectedSiteId } />
				{ content }
			</Main>
		);
	}
}

export default connect(
	( state: IAppState ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state ) ?? undefined;

		return {
			currentRoute: getCurrentRoute( state ),
			domains: getDomainsBySiteId( state, siteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId: siteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
			isSiteUpgradeable: !! siteId && isSiteUpgradeable( state, siteId ),
			isSiteOnMonthlyPlan: !! siteId && isSiteOnMonthlyPlan( state, siteId ),
			productsList: getProductsList( state ),
			userCanPurchaseGSuite: canUserPurchaseGSuite( state ),
			isDomainAndPlanPackageFlow: !! getCurrentQueryArguments( state )?.domainAndPlanPackage,
			isDomainUpsell:
				!! getCurrentQueryArguments( state )?.domainAndPlanPackage &&
				!! getCurrentQueryArguments( state )?.domain,
			isSiteOnFreePlan: !! site && !! site.plan && isFreePlanProduct( site.plan ),
			isEcommerceSite:
				!! siteId &&
				( isSiteOnECommerceTrial( state, siteId ) ||
					isSiteOnWooExpress( state, siteId ) ||
					isSiteOnEcommerce( state, siteId ) ),
			isFromMyHome: getCurrentQueryArguments( state )?.from === 'my-home',
			preferredView: getSiteOption( state, siteId, 'wpcom_admin_interface' ),
			wpAdminUrl: getSiteAdminUrl( state, siteId ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordRemoveDomainButtonClick,
		setCurrentFlowName,
	}
)( withCartKey( withShoppingCart( localize( DomainSearch ) ) ) );
