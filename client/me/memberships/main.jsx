/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryMembershipsSubscriptions from 'components/data/query-memberships-subscriptions';
import SectionHeader from 'components/section-header';
import { CompactCard } from '@automattic/components';
import EmptyContent from 'components/empty-content';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './main.scss';

/**
 * Image dependencies
 */
import noMembershipsImage from 'assets/images/illustrations/no-memberships.svg';

const MembershipListDate = ( { translate, subscription, moment } ) => {
	let endDate = translate( 'Never Expires' );
	let endDateFromNow = '-';
	if ( subscription.end_date ) {
		endDate = moment( subscription.end_date ).format( 'll' );
		endDateFromNow = translate( 'Renews %s', { args: moment( subscription.end_date ).fromNow() } );
	}

	return (
		<div className="memberships__list-date">
			<div>{ endDate }</div>
			<div className="memberships__list-sub">{ endDateFromNow }</div>
		</div>
	);
};

const MembershipRenewalPrice = ( { translate, subscription } ) => {
	const renewalPrice = formatCurrency( subscription.renewal_price, subscription.currency );
	let renewalInterval = '-';
	if ( subscription.renew_interval ) {
		renewalInterval = translate( 'Every %s', { args: subscription.renew_interval } );
	}

	return (
		<div className="memberships__list-renewal-price">
			<div className="memberships__list-amount">{ renewalPrice }</div>
			<div className="memberships__list-sub">{ renewalInterval }</div>
		</div>
	);
};

const MembershipItem = ( { translate, subscription, moment } ) => (
	<CompactCard key={ subscription.ID } href={ '/me/purchases/other/' + subscription.ID }>
		<div className="memberships__list-subscription">
			<MembershipListDate translate={ translate } subscription={ subscription } moment={ moment } />
			<div className="memberships__service-description">
				<div className="memberships__service-name">{ subscription.title }</div>
				<div className="memberships__list-sub">
					{ translate( 'On %s', { args: subscription.site_title } ) }
				</div>
			</div>
			<MembershipRenewalPrice translate={ translate } subscription={ subscription } />
		</div>
	</CompactCard>
);

const MembershipsHistory = ( { translate, subscriptions, moment } ) => {
	let content;
	if ( subscriptions && subscriptions.length ) {
		content = (
			<>
				<SectionHeader label={ translate( 'Active Recurring Payments plans' ) } />
				{ subscriptions.map(
					( subscription ) => (
						<MembershipItem
							key={ subscription.ID }
							translate={ translate }
							subscription={ subscription }
							moment={ moment }
						/>
					),
					this
				) }
			</>
		);
	} else {
		content = (
			<CompactCard className="memberships__no-content">
				<EmptyContent
					title={ translate( 'No Recurring Payments found.' ) }
					illustration={ noMembershipsImage }
				/>
			</CompactCard>
		);
	}

	return (
		<Main className="memberships">
			<DocumentHead title={ translate( 'Other Sites' ) } />
			<PageViewTracker path="/me/purchases/other" title="Me > Other Sites" />
			<MeSidebarNavigation />
			<QueryMembershipsSubscriptions />
			<PurchasesHeader section={ 'memberships' } />
			{ content }
		</Main>
	);
};

export default connect( ( state ) => ( {
	subscriptions: get( state, 'memberships.subscriptions.items', [] ),
} ) )( localize( withLocalizedMoment( MembershipsHistory ) ) );
