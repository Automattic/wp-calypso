import { getPlan, isFreePlanProduct, getIntervalTypeForTerm } from '@automattic/calypso-products';
import { useDomainSuggestions } from '@automattic/domain-picker/src';
import { useLocale } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import domainUpsellMobileIllustration from 'calypso/assets/images/customer-home/illustration--task-domain-upsell-mobile.png';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { TASK_DOMAIN_UPSELL } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { isStagingSite } from 'calypso/sites-dashboard/utils';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
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

	const shouldNotShowMyHomeUpsell = siteDomainsLength || ! isEmailVerified;

	if ( shouldNotShowMyHomeUpsell || isStagingSite( selectedSite ) ) {
		return null;
	}

	const searchTerm = selectedSiteSlug?.split( '.' )[ 0 ];

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainUpsell
				isFreePlan={ isFreePlan }
				isMonthlyPlan={ currentPlanIntervalType === 'monthly' }
				searchTerm={ searchTerm }
				siteSlug={ selectedSiteSlug }
			/>
		</CalypsoShoppingCartProvider>
	);
}

const domainSuggestionOptions = {
	vendor: 'domain-upsell',
};

export function RenderDomainUpsell( { isFreePlan, isMonthlyPlan, searchTerm, siteSlug } ) {
	const translate = useTranslate();

	const locale = useLocale();

	// Note: domainSuggestionOptions must be equal by reference upon each render
	// to avoid a render loop, since it's used to memoize a selector.
	const { allDomainSuggestions } =
		useDomainSuggestions( searchTerm, 3, undefined, locale, domainSuggestionOptions ) || {};

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

	const [ ctaIsBusy, setCtaIsBusy ] = useState( false );
	const getCtaClickHandler = async () => {
		setCtaIsBusy( true );

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
		<Task
			customClass="task__domain-upsell"
			title={ cardTitle }
			description={ preventWidows( cardSubtitle ) }
			actionText={ translate( 'Get the custom domain' ) }
			actionOnClick={ getCtaClickHandler }
			actionBusy={ ctaIsBusy }
			hasSecondaryAction={ true }
			secondaryActionText={ translate( 'Search for another domain' ) }
			secondaryActionUrl={ searchLink }
			illustration={ domainUpsellMobileIllustration }
			illustrationAlwaysShow={ true }
			badgeText={ domainSuggestionName }
			timing={ 2 }
			taskId={ TASK_DOMAIN_UPSELL }
		/>
	);
}
