/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import EmptyContent from 'calypso/components/empty-content';
import { domainAddNew, domainUseYourDomain } from 'calypso/my-sites/domains/paths';
import customerHomeIllustrationTaskFindDomain from 'calypso/assets/images/customer-home/illustration--task-find-domain.svg';
import { isFreePlan } from '@automattic/calypso-products';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';

function EmptyDomainsListNudge( { selectedSite, hasDomainCredit } ) {
	const translate = useTranslate();

	const siteHasPaidPlan =
		selectedSite?.plan?.product_slug && ! isFreePlan( selectedSite.plan.product_slug );

	if ( siteHasPaidPlan && ! hasDomainCredit ) {
		return null;
	}

	let title = translate( 'Get your domain' );
	let line = translate( 'Get a free one-year domain registration or transfer with any paid plan.' );
	let action = translate( 'Upgrade to a plan' );
	let actionURL = `/plans/${ selectedSite.slug }`;
	let secondaryAction = translate( 'Just search for a domain' );
	let secondaryActionURL = domainAddNew( selectedSite.slug );
	let contentType = 'no_plan';

	if ( siteHasPaidPlan && hasDomainCredit ) {
		title = translate( 'Claim your free domain' );
		line = translate(
			'You have a free one-year domain registration or transfer included with your plan.'
		);
		action = translate( 'Search for a domain' );
		actionURL = domainAddNew( selectedSite.slug );
		secondaryAction = translate( 'I have a domain' );
		secondaryActionURL = domainUseYourDomain( selectedSite.slug );
		contentType = 'domain_credit';
	}

	return (
		<Card>
			<EmptyContent
				title={ title }
				line={ line }
				illustration={ customerHomeIllustrationTaskFindDomain }
				illustrationWidth={ 150 }
				action={ action }
				actionURL={ actionURL }
				secondaryAction={ secondaryAction }
				secondaryActionURL={ secondaryActionURL }
			/>
			<TrackComponentView
				eventName="calypso_get_your_domain_empty_impression"
				eventProperties={ { content_type: contentType } }
			/>
		</Card>
	);
}

EmptyDomainsListNudge.propTypes = {
	selectedSite: PropTypes.object,
	hasDomainCredit: PropTypes.bool,
	domains: PropTypes.array,
};

export default EmptyDomainsListNudge;
