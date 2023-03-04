import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, isFreePlanProduct, getIntervalTypeForTerm } from '@automattic/calypso-products';
import { Button, Card, Gridicon, Spinner } from '@automattic/components';
import { useDomainSuggestions } from '@automattic/domain-picker/src';
import { useLocale } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isNotAtomicJetpack, isP2Site } from 'calypso/sites-dashboard/utils';
import { getCurrentUser, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import isSiteOnMonthlyPlan from 'calypso/state/selectors/is-site-on-monthly-plan';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function DomainUpsell( { context } ) {
	const isProfileUpsell = context === 'profile';

	const user = useSelector( getCurrentUser );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );
	const site = isProfileUpsell ? primarySite : selectedSite;

	const isMonthlyPlan = useSelector( ( state ) => isSiteOnMonthlyPlan( state, site?.ID ) );

	const isFreePlan = isFreePlanProduct( site?.plan );

	const siteDomains = useSelector( ( state ) => getDomainsBySite( state, site ) );
	const siteDomainsLength = useMemo(
		() => siteDomains.filter( ( domain ) => ! domain.isWPCOMDomain ).length,
		[ siteDomains ]
	);

	const dismissPreference = `calypso_my_home_domain_upsell_dismiss-${ site.ID }`;
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const shouldNotShowUpselDismissed = ! hasPreferences || isDismissed;

	const shouldNotShowProfileUpsell =
		isProfileUpsell &&
		( user.site_count !== 1 ||
			! isFreePlan ||
			siteDomainsLength ||
			! isEmailVerified ||
			isP2Site( primarySite ) ||
			isNotAtomicJetpack( primarySite ) );

	const shouldNotShowMyHomeUpsell = ! isProfileUpsell && ( siteDomainsLength || ! isEmailVerified );

	if ( shouldNotShowUpselDismissed || shouldNotShowProfileUpsell || shouldNotShowMyHomeUpsell ) {
		return null;
	}

	const searchTerm = isProfileUpsell ? user?.display_name : selectedSiteSlug?.split( '.' )[ 0 ];

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainUpsell
				isFreePlan={ isFreePlan }
				isMonthlyPlan={ isMonthlyPlan }
				isProfileUpsell={ isProfileUpsell }
				searchTerm={ searchTerm }
				siteSlug={ isProfileUpsell ? primarySiteSlug : selectedSiteSlug }
				dismissPreference={ dismissPreference }
			/>
		</CalypsoShoppingCartProvider>
	);
}

export function RenderDomainUpsell( {
	isFreePlan,
	isMonthlyPlan,
	isProfileUpsell,
	searchTerm,
	siteSlug,
	dismissPreference,
} ) {
	const translate = useTranslate();

	const tracksContext = isProfileUpsell ? 'profile' : 'my_home';

	const dispatch = useDispatch();
	const locale = useLocale();
	const { allDomainSuggestions } =
		useDomainSuggestions( searchTerm, 3, undefined, locale, {
			vendor: 'domain-upsell',
		} ) || {};

	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );

	// Get first non-free suggested domain.
	const domainSuggestion = allDomainSuggestions?.filter(
		( suggestion ) => ! suggestion.is_free
	)[ 0 ];

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
		recordTracksEvent( 'calypso_' + tracksContext + '_domain_upsell_search_click', {
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
		recordTracksEvent( 'calypso_' + tracksContext + '_domain_upsell_cta_click', {
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
			? translate( 'You still have a free domain to claim!' )
			: translate( 'Own your online identity with a custom domain' );

	const cardSubtitle =
		! isFreePlan && ! isMonthlyPlan
			? translate(
					'Own your online identity giving your site a memorable domain name. Your plan includes one for free for one year, so you can still claim it.'
			  )
			: translate(
					"Stake your claim on your corner of the web with a site address that's easy to find, share, and follow."
			  );

	return (
		<Card className="domain-upsell__card customer-home__card">
			<TrackComponentView eventName={ 'calypso_' + tracksContext + '_domain_upsell_impression' } />
			<div>
				<div className="domain-upsell__card-dismiss">
					<button onClick={ getDismissClickHandler }>
						<Gridicon icon="cross" />
					</button>
				</div>
				<h3>{ cardTitle }</h3>
				<p>{ cardSubtitle }</p>
				<div className="suggested-domain-name">
					<div className="card">
						<span>
							<strike>{ siteSlug }</strike>
						</span>
						<div className="badge badge--info">{ translate( 'Current' ) }</div>
					</div>
					<div className="card">
						<span>{ domainSuggestionName }</span>
						{ domainSuggestion?.domain_name ? (
							<div className="badge badge--success">{ translate( 'Available' ) }</div>
						) : (
							<div className="badge">
								<Spinner />
							</div>
						) }
					</div>
				</div>

				<div className="domain-upsell-actions">
					<Button href={ searchLink } onClick={ getSearchClickHandler }>
						{ translate( 'Search for a domain' ) }
					</Button>
					<Button primary onClick={ getCtaClickHandler } busy={ ctaIsBusy }>
						{ translate( 'Buy this domain' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
}
