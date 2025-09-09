import { isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { UseShoppingCart, withShoppingCart } from '@automattic/shopping-cart';
import { addQueryArgs, getQueryArgs, getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { localize, translate, useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import {
	hasPlan,
	domainTransfer,
	domainRegistration,
	ObjectWithProducts,
} from 'calypso/lib/cart-values/cart-items';
import { useIsDomainSearchV2Enabled } from 'calypso/lib/domains/use-domain-search-v2';
import { isExternal } from 'calypso/lib/url';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import DomainAndPlanPackageNavigation from 'calypso/my-sites/domains/components/domain-and-plan-package/navigation';
import NewDomainsRedirectionNoticeUpsell from 'calypso/my-sites/domains/domain-management/components/domain/new-domains-redirection-notice-upsell';
import {
	domainAddEmailUpsell,
	domainManagementList,
	domainUseMyDomain,
} from 'calypso/my-sites/domains/paths';
import { RenderDomainsStep, submitDomainStepSelection } from 'calypso/signup/steps/domains';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordRemoveDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'calypso/state/domains/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isSiteOnMonthlyPlan from 'calypso/state/selectors/is-site-on-monthly-plan';
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import { setCurrentFlowName } from 'calypso/state/signup/flow/actions';
import { fetchUsernameSuggestion } from 'calypso/state/signup/optional-dependencies/actions';
import { setDesignType } from 'calypso/state/signup/steps/design-type/actions';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
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
import { recordUseYourDomainButtonClick } from '../../../components/domains/register-domain-step/analytics';
import type { DomainSuggestion } from '@automattic/api-core';
import type { Context } from '@automattic/calypso-router';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';
import 'calypso/my-sites/domains/style.scss';

const noop = () => {};

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
		flowName?: string,
		rootVendor?: string
	) => void;
	recordRemoveDomainButtonClick: ( domainName: string ) => void;
	recordUseYourDomainButtonClick: (
		section: string,
		source: string | null,
		flowName: string
	) => void;
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
	submitDomainStepSelection: ( suggestion: DomainSuggestion, section: string ) => void;
	designType: string;
	setDesignType: ( designType: string ) => void;
	fetchUsernameSuggestion: ( username: string ) => void;
};

class DomainSearch extends Component< DomainSearchProps > {
	isMounted = false;

	state = {
		domainRegistrationAvailable: true,
		domainRegistrationMaintenanceEndTime: null,
		step: {},
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

	getUseYourDomainUrl = ( lastQuery?: string ) => {
		let useYourDomainUrl;

		useYourDomainUrl = `${ this.props.basePath }/use-your-domain`;

		if ( this.props.selectedSite ) {
			useYourDomainUrl = domainUseMyDomain( this.props.selectedSite.slug, {
				domain: lastQuery?.trim(),
			} );
		}

		return useYourDomainUrl;
	};

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

	getDomainAndPlanPackageBackButtonProps() {
		const backTo = ( getQueryArg( window.location.href, 'back_to' ) ?? '' ) as string;
		if ( ! isExternal( backTo ) ) {
			return {
				goBackText: translate( 'Back' ),
				goBackLink: backTo,
			};
		}

		const { selectedSite, selectedSiteSlug, preferredView, wpAdminUrl } = this.props;
		const launchpadScreen = selectedSite?.options?.launchpad_screen;
		const siteIntent = selectedSite?.options?.site_intent;
		return launchpadScreen === 'full'
			? {
					goBackText: translate( 'Next Steps' ),
					goBackLink: `/setup/${ siteIntent }/launchpad?siteSlug=${ selectedSiteSlug }`,
			  }
			: {
					goBackLink:
						preferredView === 'wp-admin' && !! wpAdminUrl
							? wpAdminUrl
							: `/home/${ selectedSiteSlug }`,
			  };
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
		} = this.props;

		if ( ! selectedSite || ! selectedSiteId ) {
			return null;
		}

		const classes = clsx( 'main-column', {
			'domain-search-page-wrapper': this.state.domainRegistrationAvailable,
		} );
		const { domainRegistrationMaintenanceEndTime } = this.state;

		const hasPlanInCart = hasPlan( cart );
		const hrefForDecideLater = addQueryArgs( `/plans/yearly/${ selectedSiteSlug }`, {
			domainAndPlanPackage: true,
		} );

		let content;
		if ( ! this.state.domainRegistrationAvailable ) {
			let maintenanceEndTime = translate( 'shortly', {
				comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
			} );
			if ( domainRegistrationMaintenanceEndTime ) {
				maintenanceEndTime = moment.unix( domainRegistrationMaintenanceEndTime ).fromNow();
			}

			content = (
				<EmptyContent
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
										{ ...this.getDomainAndPlanPackageBackButtonProps() }
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

						{ ! hasPlanInCart && ! this.props.domainAndPlanUpsellFlow && (
							<NewDomainsRedirectionNoticeUpsell />
						) }
						<RenderDomainsStep
							hideMatchReasons={ false }
							goToNextStep={ async () => {
								const domains = this.props.cart.products.filter(
									( p ) => p.is_domain_registration
								);

								if ( this.props.domainAndPlanUpsellFlow ) {
									const domain = domains[ 0 ];
									const queryArgs = getQueryArgs( window.location.href );
									const registration = domainRegistration( {
										domain: domain.meta,
										productSlug: domain.product_slug,
										extra: domain.extra,
									} );

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
											? addQueryArgs( `/checkout/${ this.props.selectedSiteSlug }`, queryArgs )
											: addQueryArgs(
													`/plans/${ intervalTypePath }${ this.props.selectedSiteSlug }`,
													{
														...queryArgs,
														domainAndPlanPackage: true,
														domain: this.props.isDomainUpsell ? domain : undefined,
													}
											  );
									page( nextStepLink );
									return;
								}

								if ( domains.length === 1 ) {
									page( domainAddEmailUpsell( this.props.selectedSiteSlug, domains[ 0 ].meta ) );
								} else {
									page( `/checkout/${ this.props.selectedSiteSlug }` );
								}
							} }
							step={ this.state.step }
							saveSignupStep={ ( step: Record< string, unknown > ) => {
								this.setState( { step: { ...this.state.step, ...step } } );
							} }
							handleAddMapping={ this.handleAddMapping }
							handleAddTransfer={ this.handleAddTransfer }
							getUseYourDomainUrl={ this.getUseYourDomainUrl }
							submitSignupStep={ noop }
							showAlreadyOwnADomain
							isDomainOnly={ false }
							domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
							onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
							suggestion={ this.getInitialSuggestion() }
							positionInFlow={ 0 }
							analyticsSection="domains"
							flowName="domains/add"
							stepName="domains-search"
							cart={ this.props.cart }
							productsList={ this.props.productsList }
							domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
							includeWordPressDotCom={ false }
							translate={ translate }
							path={ this.props.basePath }
							shoppingCartManager={ this.props.shoppingCartManager }
							selectedSite={ selectedSite }
							recordAddDomainButtonClick={ this.props.recordAddDomainButtonClick }
							recordRemoveDomainButtonClick={ this.props.recordRemoveDomainButtonClick }
							recordUseYourDomainButtonClick={ ( section: string ) =>
								this.props.recordUseYourDomainButtonClick( section, null, 'domains' )
							}
							submitDomainStepSelection={ this.props.submitDomainStepSelection }
							designType={ this.props.designType }
							setDesignType={ this.props.setDesignType }
							fetchUsernameSuggestion={ this.props.fetchUsernameSuggestion }
							render={ ( {
								mainContent,
								sideContent,
							}: {
								mainContent: React.ReactNode;
								sideContent: React.ReactNode;
							} ) => {
								return (
									<div className="site-domains-add-page">
										<div className="domains__step-content domains__step-content-domain-step">
											{ mainContent }
											{ sideContent }
										</div>
									</div>
								);
							} }
						/>
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes } wideLayout>
				<QueryProductsList />
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<QuerySiteDomains siteId={ selectedSiteId } />
				{ content }
			</Main>
		);
	}
}

const StyleWrappedDomainSearch = ( props: DomainSearchProps ) => {
	const [ isLoading, shouldUseDomainSearchV2 ] = useIsDomainSearchV2Enabled( 'domains/add' );

	if ( isLoading ) {
		return null;
	}

	return (
		<>
			<DomainSearch { ...props } />
			{ ! shouldUseDomainSearchV2 && (
				<BodySectionCssClass bodyClass={ [ 'domain-search-legacy--my-sites' ] } />
			) }
		</>
	);
};

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
			designType: getDesignType( state ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		recordRemoveDomainButtonClick,
		recordUseYourDomainButtonClick,
		setCurrentFlowName,
		submitDomainStepSelection,
		setDesignType,
		fetchUsernameSuggestion,
	}
)( withCartKey( withShoppingCart( localize( StyleWrappedDomainSearch ) ) ) );
