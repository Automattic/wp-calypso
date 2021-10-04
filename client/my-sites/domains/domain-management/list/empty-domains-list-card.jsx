import { isFreePlan } from '@automattic/calypso-products';
import { Card, Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import customerHomeIllustrationTaskFindDomain from 'calypso/assets/images/customer-home/illustration--task-find-domain.svg';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { domainAddNew, domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function EmptyDomainsListCard( {
	selectedSite,
	hasDomainCredit,
	isCompact,
	dispatchRecordTracksEvent,
	hasNonWpcomDomains,
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

	let title = translate( 'Get your domain' );
	let line = translate( 'Get a free one-year domain registration or transfer with any paid plan.' );
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
		line = translate(
			'You have a free one-year domain registration or transfer included with your plan.'
		);
		action = translate( 'Search for a domain' );
		actionURL = domainAddNew( selectedSite.slug );
		secondaryAction = translate( 'I have a domain' );
		secondaryActionURL = domainUseMyDomain( selectedSite.slug );
		contentType = 'free_domain_credit';
	}

	const illustration = customerHomeIllustrationTaskFindDomain && (
		<img src={ customerHomeIllustrationTaskFindDomain } alt="" width={ 150 } />
	);

	return (
		<Card className="empty-domains-list-card">
			<div
				className={ classNames( 'empty-domains-list-card__wrapper', {
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
	hasNonWpcomDomains: PropTypes.bool,
};

export default connect( null, { dispatchRecordTracksEvent: recordTracksEvent } )(
	EmptyDomainsListCard
);
