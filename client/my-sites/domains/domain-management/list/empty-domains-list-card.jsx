import { isEnabled } from '@automattic/calypso-config';
import { PLAN_100_YEARS, domainProductSlugs, isFreePlan } from '@automattic/calypso-products';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { domainAddNew, domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { isFetchingUserPurchases } from 'calypso/state/purchases/selectors/fetching';
import { EmptyDomainsListCardSkeleton } from './empty-domains-list-card-skeleton';

import './empty-domains-list-card-styles.scss';

function EmptyDomainsListCard( { selectedSite, hasDomainCredit, isCompact, hasNonWpcomDomains } ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const siteHasPaidPlan =
		selectedSite?.plan?.product_slug && ! isFreePlan( selectedSite.plan.product_slug );

	const siteHasHundredYearPlan = selectedSite?.plan?.product_slug === PLAN_100_YEARS;

	const isLoadingUserPurchases = useSelector( isFetchingUserPurchases );

	let title = translate( 'Get your free domain' );
	let line = translate(
		'Get a free one-year domain registration or transfer with any annual paid plan.'
	);
	let secondLine;
	let action = translate( 'Upgrade to a plan' );
	let actionURL = `/plans/${ selectedSite?.slug }`;
	let secondaryAction = translate( 'Just search for a domain' );
	let secondaryActionURL = domainAddNew( selectedSite?.slug );
	let contentType = 'no_plan';

	const domainRegistrationProduct = useSelector( ( state ) =>
		getProductBySlug( state, domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION )
	);
	const domainProductCost = domainRegistrationProduct?.combined_cost_display;
	const domainToPlanCreditsApplicable = useDomainToPlanCreditsApplicable( selectedSite?.ID );

	if ( isLoadingUserPurchases ) {
		return null;
	}

	if (
		isEnabled( 'domain-to-plan-credit' ) &&
		domainToPlanCreditsApplicable !== null &&
		domainToPlanCreditsApplicable > 0
	) {
		return null;
	}

	if ( siteHasPaidPlan && ! hasDomainCredit ) {
		if ( hasNonWpcomDomains ) {
			return null;
		}
		title = translate( 'Add your domain' );
		line = translate( 'You have no domains added to this site.' );
		action = translate( 'Search for a domain' );
		actionURL = domainAddNew( selectedSite.slug );
		secondaryAction = translate( 'Use a domain I own' );
		secondaryActionURL = domainUseMyDomain( selectedSite.slug );
		contentType = 'paid_plan_with_no_free_domain_credits';
	}

	if ( siteHasPaidPlan && hasDomainCredit ) {
		title = translate( 'Claim your free domain' );
		if ( siteHasHundredYearPlan ) {
			line = translate(
				'You have a free domain registration or transfer included with your plan.'
			);
		} else {
			line = translate(
				'You have a free one-year domain registration or transfer included with your plan.'
			);
			secondLine = hasEnTranslation
				? translate(
						'Don’t worry about expensive domain renewals—.com, .net, and .org start at just %(domainPrice)s.',
						{
							args: {
								domainPrice: domainProductCost,
							},
						}
				  )
				: null;
		}
		action = translate( 'Search for a domain' );
		actionURL = domainAddNew( selectedSite.slug );
		secondaryAction = translate( 'Use a domain I own' );
		secondaryActionURL = domainUseMyDomain( selectedSite.slug, {
			redirectTo: `/domains/manage/${ selectedSite.slug }`,
		} );
		contentType = 'free_domain_credit';
	}

	const className = clsx( {
		'has-non-wpcom-domains': hasNonWpcomDomains,
	} );

	return (
		<>
			{ siteHasPaidPlan && hasDomainCredit && ! siteHasHundredYearPlan && <QueryProductsList /> }
			<EmptyDomainsListCardSkeleton
				className={ className }
				isCompact={ isCompact }
				title={ title }
				line={ line }
				secondLine={ secondLine }
				contentType={ contentType }
				action={ action }
				actionURL={ actionURL }
				secondaryAction={ secondaryAction }
				secondaryActionURL={ secondaryActionURL }
			/>
		</>
	);
}

EmptyDomainsListCard.propTypes = {
	selectedSite: PropTypes.object,
	hasDomainCredit: PropTypes.bool,
	isCompact: PropTypes.bool,
	domains: PropTypes.array,
	dispatchRecordTracksEvent: PropTypes.func,
	hasNonWpcomDomains: PropTypes.bool,
};

export default EmptyDomainsListCard;
