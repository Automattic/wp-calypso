/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { domainAddNew, domainUseYourDomain } from 'calypso/my-sites/domains/paths';
import customerHomeIllustrationTaskFindDomain from 'calypso/assets/images/customer-home/illustration--task-find-domain.svg';
import { isFreePlan } from '@automattic/calypso-products';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function EmptyDomainsListCard( {
	selectedSite,
	hasDomainCredit,
	isCompact,
	dispatchRecordTracksEvent,
} ) {
	const translate = useTranslate();

	const getActionClickHandler = ( type, buttonURL, sourceCardType ) => () => {
		dispatchRecordTracksEvent( 'calypso_empty_domain_list_card_action', {
			button_type: type,
			button_url: buttonURL,
			source_card_type: sourceCardType,
		} );
	};

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
		contentType = 'free_domain_credit';
	}

	const illustration = customerHomeIllustrationTaskFindDomain && (
		<img src={ customerHomeIllustrationTaskFindDomain } alt="" width={ 150 } />
	);

	return (
		<Card>
			<div
				className={ classNames( 'empty-domains-list-card', {
					'is-compact': isCompact,
					'has-title-only': title && ! line,
				} ) }
			>
				<div className="empty-domains-list-card__illustration">{ illustration }</div>
				<div className="empty-domains-list-card__content">
					<div className="empty-domains-list-card__text">
						{ title ? <h2>{ title }</h2> : null }
						{ line ? <h3>{ line }</h3> : null }
					</div>
					<div className="empty-domains-list-card__actions">
						<Button
							primary
							onClick={ getActionClickHandler( 'primary', actionURL, contentType ) }
							href={ actionURL }
						>
							{ action }
						</Button>
						<Button
							onClick={ getActionClickHandler( 'secondary', secondaryActionURL, contentType ) }
							href={ secondaryActionURL }
						>
							{ secondaryAction }
						</Button>
					</div>
				</div>
			</div>
			<TrackComponentView
				eventName="calypso_get_your_domain_empty_impression"
				eventProperties={ { content_type: contentType } }
			/>
		</Card>
	);
}

EmptyDomainsListCard.propTypes = {
	selectedSite: PropTypes.object,
	hasDomainCredit: PropTypes.bool,
	isCompact: PropTypes.bool,
	domains: PropTypes.array,
	dispatchRecordTracksEvent: PropTypes.func,
};

export default connect( null, { dispatchRecordTracksEvent: recordTracksEvent } )(
	EmptyDomainsListCard
);
