import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, isFreePlanProduct, getIntervalTypeForTerm } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card, Gridicon, Spinner } from '@automattic/components';
import { useDomainSuggestions } from '@automattic/domain-picker';
import { useLocale } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isNotAtomicJetpack, isP2Site, isStagingSite } from 'calypso/sites-dashboard/utils';
import { getCurrentUser, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export default function DomainUpsell() {
	const user = useSelector( getCurrentUser );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const selectedSite = useSelector( getSelectedSite );

	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, primarySite?.ID ) );
	const currentPlanIntervalType = getIntervalTypeForTerm(
		getPlan( currentPlan?.productSlug )?.term
	);

	const isFreePlan = isFreePlanProduct( primarySite?.plan );

	const siteDomains = useSelector( ( state ) => getDomainsBySite( state, primarySite ) );
	const siteDomainsLength = useMemo(
		() => siteDomains.filter( ( domain ) => ! domain.isWPCOMDomain ).length,
		[ siteDomains ]
	);

	const dismissPreference = `calypso_profile_domain_upsell_dismiss-${ primarySite?.ID }`;
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const shouldNotShowUpsellDismissed = ! hasPreferences || isDismissed;

	const shouldNotShowProfileUpsell =
		user.site_count !== 1 ||
		! isFreePlan ||
		siteDomainsLength ||
		! isEmailVerified ||
		isP2Site( primarySite ) ||
		isNotAtomicJetpack( primarySite );

	if (
		shouldNotShowUpsellDismissed ||
		shouldNotShowProfileUpsell ||
		isStagingSite( selectedSite )
	) {
		return null;
	}

	const searchTerm = user?.display_name;

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainUpsell
				isFreePlan={ isFreePlan }
				isMonthlyPlan={ currentPlanIntervalType === 'monthly' }
				searchTerm={ searchTerm }
				siteSlug={ primarySiteSlug }
				dismissPreference={ dismissPreference }
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

	const searchLink = addQueryArgs(
		{
			domainAndPlanPackage: true,
			domain: true,
		},
		`/domains/add/${ siteSlug }`
	);
	const getSearchClickHandler = () => {
		recordTracksEvent( 'calypso_profile_domain_upsell_search_click', {
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
		recordTracksEvent( 'calypso_profile_domain_upsell_dismiss_click' );
		dispatch( savePreference( dismissPreference, 1 ) );
	};
	const [ ctaIsBusy, setCtaIsBusy ] = useState( false );
	const getCtaClickHandler = async () => {
		setCtaIsBusy( true );
		recordTracksEvent( 'calypso_profile_domain_upsell_cta_click', {
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

	const cardTitle =
		! isFreePlan && ! isMonthlyPlan
			? translate( 'Make your mark online with a memorable domain name' )
			: translate( 'Own your online identity with a custom domain' );

	const cardSubtitle =
		! isFreePlan && ! isMonthlyPlan
			? translate(
					'Your plan includes a free domain for the first year. Stake your claim on the web with a domain name that boosts your brand.'
			  )
			: translate(
					"Stake your claim on your corner of the web with a site address that's easy to find, share, and follow."
			  );

	return (
		<Card className="profile-domain-upsell__card customer-home__card">
			<TrackComponentView eventName="calypso_profile_domain_upsell_impression" />
			<div>
				<div className="profile-domain-upsell__card-dismiss">
					<button onClick={ getDismissClickHandler }>
						<Gridicon icon="cross" width={ 18 } />
					</button>
				</div>
				<h3>{ cardTitle }</h3>
				<p>{ cardSubtitle }</p>
				<div className="suggested-domain-name">
					<div className="card">
						<span>{ siteSlug }</span>
						<div className="badge badge--info">{ translate( 'Current' ) }</div>
					</div>
					<div className="card">
						<span>{ domainSuggestionName }</span>
						{ domainSuggestion?.domain_name ? (
							<div className="badge badge--success">{ translate( 'Recommended' ) }</div>
						) : (
							<div className="badge">
								<Spinner />
							</div>
						) }
					</div>
				</div>

				<div className="domain-upsell-actions">
					<Button href={ searchLink } onClick={ getSearchClickHandler }>
						{ translate( 'Search for another domain' ) }
					</Button>
					<Button primary onClick={ getCtaClickHandler } busy={ ctaIsBusy }>
						{ translate( 'Buy this domain' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
}
