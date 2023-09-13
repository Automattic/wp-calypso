import { PLAN_100_YEARS, isFreePlan } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { domainAddNew, domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { EmptyDomainsListCardSkeleton } from './empty-domains-list-card-skeleton';

import './style.scss';

function EmptyDomainsListCard( { selectedSite, hasDomainCredit, isCompact, hasNonWpcomDomains } ) {
	const translate = useTranslate();

	const siteHasPaidPlan =
		selectedSite?.plan?.product_slug && ! isFreePlan( selectedSite.plan.product_slug );

	const siteHasHundredYearPlan = selectedSite?.plan?.product_slug === PLAN_100_YEARS;

	let title = translate( 'Get your domain' );
	let line = translate(
		'Get a free one-year domain registration or transfer with any annual paid plan.'
	);
	let action = translate( 'Upgrade to a plan' );
	let actionURL = `/plans/${ selectedSite.slug }`;
	let secondaryAction = translate( 'Just search for a domain' );
	let secondaryActionURL = domainAddNew( selectedSite.slug );
	let contentType = 'no_plan';

	if ( siteHasPaidPlan && ! hasDomainCredit ) {
		if ( hasNonWpcomDomains ) {
			return null;
		}
		title = translate( 'Add your domain' );
		line = translate( 'You have no domains added to this site.' );
		action = translate( 'Search for a domain' );
		actionURL = domainAddNew( selectedSite.slug );
		secondaryAction = translate( 'I have a domain' );
		secondaryActionURL = domainUseMyDomain( selectedSite.slug );
		contentType = 'paid_plan_with_no_free_domain_credits';
	}

	if ( siteHasPaidPlan && hasDomainCredit ) {
		title = translate( 'Claim your free domain' );
		line = siteHasHundredYearPlan
			? translate( 'You have a free domain registration or transfer included with your plan.' )
			: translate(
					'You have a free one-year domain registration or transfer included with your plan.'
			  );
		action = translate( 'Search for a domain' );
		actionURL = domainAddNew( selectedSite.slug );
		secondaryAction = translate( 'I have a domain' );
		secondaryActionURL = domainUseMyDomain( selectedSite.slug );
		contentType = 'free_domain_credit';
	}

	const className = classNames( {
		'has-non-wpcom-domains': hasNonWpcomDomains,
	} );

	return (
		<EmptyDomainsListCardSkeleton
			className={ className }
			isCompact={ isCompact }
			title={ title }
			line={ line }
			contentType={ contentType }
			action={ action }
			actionURL={ actionURL }
			secondaryAction={ secondaryAction }
			secondaryActionURL={ secondaryActionURL }
		/>
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
