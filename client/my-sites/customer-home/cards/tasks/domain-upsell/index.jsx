import {
	getPlan,
	isFreePlanProduct,
	getIntervalTypeForTerm,
	domainProductSlugs,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useDomainSuggestions } from '@automattic/domain-picker/src';
import { useHasEnTranslation, useLocale } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useMemo } from '@wordpress/element';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import backgroundDotsIllustration from 'calypso/assets/images/customer-home/illustration--background-dots.svg';
import editorPreviewIllustration from 'calypso/assets/images/customer-home/illustration--preview-editor.svg';
import sitePreviewIllustration from 'calypso/assets/images/customer-home/illustration--preview-site.png';
import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { TASK_DOMAIN_UPSELL } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { isStagingSite } from 'calypso/sites-dashboard/utils';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
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
	include_wordpressdotcom: false,
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
	const domainSuggestion = allDomainSuggestions?.[ 0 ];

	// It takes awhile to suggest a domain name. Set a default to an empty string.
	const domainSuggestionName = domainSuggestion?.domain_name ?? '';

	const domainSuggestionProductSlug = domainSuggestion?.product_slug;

	useQueryProductsList();

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
			? translate( 'That perfect domain is waiting' )
			: translate( 'Own a domain. Build a site.' );

	const updatedCopy = translate(
		'{{strong}}%(domainSuggestion)s{{/strong}} is a perfect site address. It’s available, easy to find, share, and follow. Get it now and claim a corner of the web.',
		{
			components: {
				strong: <strong />,
			},
			args: {
				domainSuggestion: domainSuggestionName,
				domainPrice: domainProductCost,
			},
		}
	);

	const oldCopy = translate(
		"{{strong}}%(domainSuggestion)s{{/strong}} is a perfect site address. It's available and easy to find and follow. Get it now and claim a corner of the web.",
		{
			components: {
				strong: <strong />,
			},
			args: {
				domainSuggestion: domainSuggestionName,
				domainPrice: domainProductCost,
			},
		}
	);

	const hasTranslationForNewCopy = useHasEnTranslation()(
		"{{strong}}%(domainSuggestion)s{{/strong}} is the perfect site address. It's available and easy to find and follow. And .com, .net, and .org domains start at just %(domainPrice)s—Get it now and claim a corner of the web."
	);

	const cardSubtitleFreePlansCopy = hasTranslationForNewCopy ? updatedCopy : oldCopy;

	const cardSubtitle =
		! isFreePlan && ! isMonthlyPlan
			? translate(
					"{{strong}}%(domainSuggestion)s{{/strong}} is included free for one year with any paid plan. Claim it and start building a site that's easy to find, share and follow.",
					{
						components: {
							strong: <strong />,
						},
						args: {
							domainSuggestion: domainSuggestionName,
						},
					}
			  )
			: cardSubtitleFreePlansCopy;

	return (
		<Task
			customClass="task__domain-upsell"
			title={ cardTitle }
			description={ preventWidows( cardSubtitle ) }
			actionText={ translate( 'Get this domain' ) }
			actionOnClick={ getCtaClickHandler }
			actionBusy={ ctaIsBusy }
			hasSecondaryAction
			secondaryActionText={ translate( 'Find other domains' ) }
			secondaryActionUrl={ searchLink }
			illustration={ <UpsellIllustration domain={ domainSuggestionName } /> }
			illustrationAlwaysShow
			taskId={ TASK_DOMAIN_UPSELL }
		/>
	);
}

function UpsellIllustration( { domain } ) {
	const domainParts = domain.split( '.' );

	return (
		<div className="task__domain-upsell-illustration">
			<img
				className="task__domain-upsell-illustration--background"
				src={ backgroundDotsIllustration }
				alt=""
			/>
			<img
				className="task__domain-upsell-illustration--editor"
				src={ editorPreviewIllustration }
				alt=""
			/>
			<div className="task__domain-upsell-illustration--mask"></div>
			<img
				className="task__domain-upsell-illustration--site"
				src={ sitePreviewIllustration }
				alt=""
			/>
			<div className="task__domain-upsell-illustration--domain">
				<Icon icon={ lock } size="16" />
				<div>
					{ domainParts.map( ( part, index ) => (
						<span key={ index }>{ index === 0 ? part : `.${ part }` }</span>
					) ) }
				</div>
			</div>
		</div>
	);
}
