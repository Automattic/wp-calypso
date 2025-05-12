import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	getPlan,
	isFreePlanProduct,
	getIntervalTypeForTerm,
	is100YearPlan,
	domainProductSlugs,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card, Gridicon } from '@automattic/components';
import { useDomainSuggestions } from '@automattic/domain-picker';
import { useLocale } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useMemo } from '@wordpress/element';
import { isRTL } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import domainUpsellIllustration from 'calypso/assets/images/customer-home/illustration--feature-domain-upsell.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isStagingSite } from 'calypso/sites-dashboard/utils';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function DomainUpsell() {
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSite?.ID ) );
	const currentPlanIntervalType = getIntervalTypeForTerm(
		getPlan( currentPlan?.productSlug )?.term
	);

	const isFreePlan = isFreePlanProduct( selectedSite?.plan );

	const siteDomains = useSelector( ( state ) => getDomainsBySite( state, selectedSite ) );
	const siteDomainsLength = useMemo(
		() => siteDomains.filter( ( domain ) => ! domain.isWPCOMDomain ).length,
		[ siteDomains ]
	);

	const dismissPreference = `calypso_my_home_domain_upsell_dismiss-${ selectedSite?.ID }`;
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const shouldNotShowUpselDismissed = ! hasPreferences || isDismissed;

	const shouldNotShowMyHomeUpsell = siteDomainsLength || ! isEmailVerified;

	if ( shouldNotShowUpselDismissed || shouldNotShowMyHomeUpsell || isStagingSite( selectedSite ) ) {
		return null;
	}

	const searchTerm = selectedSiteSlug?.split( '.' )[ 0 ];

	const is100YearPlanSite = is100YearPlan( currentPlan?.productSlug );

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainUpsell
				isFreePlan={ isFreePlan }
				isMonthlyPlan={ currentPlanIntervalType === 'monthly' }
				searchTerm={ searchTerm }
				siteSlug={ selectedSiteSlug }
				dismissPreference={ dismissPreference }
				is100YearPlanSite={ is100YearPlanSite }
			/>
		</CalypsoShoppingCartProvider>
	);
}

const domainSuggestionOptions = {
	vendor: 'domain-upsell',
	include_wordpressdotcom: false,
};

export function RenderDomainUpsell( {
	isFreePlan,
	isMonthlyPlan,
	searchTerm,
	siteSlug,
	dismissPreference,
	is100YearPlanSite,
} ) {
	const translate = useTranslate();

	const dispatch = useDispatch();
	const locale = useLocale();

	// Note: domainSuggestionOptions must be equal by reference upon each render
	// to avoid a render loop, since it's used to memoize a selector.
	const { allDomainSuggestions } =
		useDomainSuggestions( searchTerm, 3, undefined, locale, domainSuggestionOptions ) || {};

	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );

	// Get first non-free suggested domain.
	const domainSuggestion = allDomainSuggestions?.[ 0 ];

	// It takes awhile to suggest a domain name. Set a default to an empty string.
	const domainSuggestionName = domainSuggestion?.domain_name ?? '';

	const domainSuggestionProductSlug = domainSuggestion?.product_slug;

	const domainRegistrationProduct = useSelector( ( state ) =>
		getProductBySlug( state, domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION )
	);
	const domainProductCost = domainRegistrationProduct?.combined_cost_display;

	const searchLink = addQueryArgs(
		{
			domainAndPlanPackage: true,
			domain: true,
		},
		`/domains/add/${ siteSlug }`
	);
	const getSearchClickHandler = () => {
		recordTracksEvent( 'calypso_my_home_domain_upsell_search_click', {
			button_url: searchLink,
			domain_suggestion: domainSuggestionName,
			product_slug: domainSuggestionProductSlug,
		} );
	};

	const purchaseLink =
		! isFreePlan && ! isMonthlyPlan
			? `/checkout/${ siteSlug }`
			: addQueryArgs(
					{
						domain: true,
						domainAndPlanPackage: true,
					},
					`/plans/yearly/${ siteSlug }`
			  );

	const getDismissClickHandler = () => {
		recordTracksEvent( 'calypso_my_home_domain_upsell_dismiss_click' );
		dispatch( savePreference( dismissPreference, 1 ) );
	};
	const [ ctaIsBusy, setCtaIsBusy ] = useState( false );
	const getCtaClickHandler = async () => {
		setCtaIsBusy( true );
		recordTracksEvent( 'calypso_my_home_domain_upsell_cta_click', {
			button_url: purchaseLink,
			domain_suggestion: domainSuggestionName,
			product_slug: domainSuggestionProductSlug,
		} );

		try {
			await shoppingCartManager.addProductsToCart( [
				domainRegistration( {
					productSlug: domainSuggestionProductSlug,
					domain: domainSuggestionName,
				} ),
			] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return null;
		}
		page( purchaseLink );
	};

	const getCardSubtitle = () => {
		const translateProps = {
			components: {
				strong: <strong />,
			},
			args: {
				domainSuggestion: domainSuggestionName,
			},
		};
		if ( is100YearPlanSite ) {
			return translate(
				"{{strong}}%(domainSuggestion)s{{/strong}} is included free with your plan. Claim it and start building a site that's easy to find, share and follow.",
				translateProps
			);
		}
		if ( ! isFreePlan && ! isMonthlyPlan ) {
			return translate(
				"{{strong}}%(domainSuggestion)s{{/strong}} is included free for one year with any paid plan. Claim it and start building a site that's easy to find, share and follow.",
				translateProps
			);
		}

		return translate(
			"{{strong}}%(domainSuggestion)s{{/strong}} is a perfect site address. It's available and easy to find and follow. Get it now and claim a corner of the web.",
			translateProps
		);
	};

	const cardTitle =
		! isFreePlan && ! isMonthlyPlan
			? translate( 'That perfect domain is waiting' )
			: translate( 'Own a domain. Build a site.' );

	const cardSubtitle = getCardSubtitle();

	const domainNameSVG = (
		<svg viewBox="0 0 40 18" id="map">
			<text
				x={ isRTL() ? 115 : -115 }
				y="15"
				textAnchor={ isRTL() ? 'end' : 'start' }
				direction="ltr"
			>
				{ domainSuggestionName.length > 34
					? `${ domainSuggestionName.slice( 0, 32 ) }...`
					: domainSuggestionName }
			</text>
		</svg>
	);

	const illustrationHeader = domainSuggestionName ? domainNameSVG : null;

	return (
		<Card className="domain-upsell__card customer-home__card is-large-hero">
			<QueryProductsList />
			<TrackComponentView eventName="calypso_my_home_domain_upsell_impression" />
			<div>
				<div className="domain-upsell__card-dismiss">
					<button
						aria-label={ translate( 'Dismiss domain name promotion' ) }
						onClick={ getDismissClickHandler }
					>
						<Gridicon icon="cross" width={ 18 } />
					</button>
				</div>
				<h3>{ cardTitle }</h3>
				<p className="domain-upsell-subtitle">{ cardSubtitle }</p>
				{ domainProductCost && (
					<p className="domain-upsell-description">
						{ translate(
							'Don’t worry about expensive domain renewals—.com, .net, and .org start at just %(domainPrice)s.',
							{
								args: {
									domainPrice: domainProductCost,
								},
							}
						) }
					</p>
				) }
				<div className="domain-upsell-illustration">
					{ illustrationHeader && <> { illustrationHeader } </> }
					<img src={ domainUpsellIllustration } alt="" />
				</div>
				<div className="domain-upsell-actions">
					<Button primary onClick={ getCtaClickHandler } busy={ ctaIsBusy }>
						{ translate( 'Get this domain' ) }
					</Button>
					<Button href={ searchLink } onClick={ getSearchClickHandler }>
						{ translate( 'Search for a domain' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
}
