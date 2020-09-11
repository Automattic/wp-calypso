/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
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
import { getAllSubscriptions } from 'state/memberships/subscriptions/selectors';

/**
 * Style dependencies
 */
import './main.scss';

/**
 * Image dependencies
 */
import noMembershipsImage from 'assets/images/illustrations/no-memberships.svg';

const getMembershipEndDate = ( translate, endDate, moment ) => {
	if ( ! endDate ) {
		return translate( 'Never Expires' );
	}
	return moment( endDate ).format( 'll' );
};

const getMembershipEndDateFromNow = ( translate, endDate, moment ) => {
	if ( ! endDate ) {
		return '-';
	}
	return translate( 'Renews %s', { args: moment( endDate ).fromNow() } );
};

const getMembershipRenewalInterval = ( translate, renewalInterval ) => {
	if ( ! renewalInterval ) {
		return '-';
	}
	return translate( 'Every %s', { args: renewalInterval } );
};

const MembershipItem = ( { translate, subscription, moment } ) => (
	<CompactCard key={ subscription.ID } href={ '/me/purchases/other/' + subscription.ID }>
		<div className="memberships__list-subscription">
			<div className="memberships__list-date">
				<div>{ getMembershipEndDate( translate, subscription.end_date, moment ) }</div>
				<div className="memberships__list-sub">
					{ getMembershipEndDateFromNow( translate, subscription.end_date, moment ) }
				</div>
			</div>
			<div className="memberships__service-description">
				<div className="memberships__service-name">{ subscription.title }</div>
				<div className="memberships__list-sub">
					{ translate( 'On %s', { args: subscription.site_title } ) }
				</div>
			</div>
			<div className="memberships__list-renewal-price">
				<div className="memberships__list-amount">
					{ formatCurrency( subscription.renewal_price, subscription.currency ) }
				</div>
				<div className="memberships__list-sub">
					{ getMembershipRenewalInterval( translate, subscription.renew_interval ) }
				</div>
			</div>
		</div>
	</CompactCard>
);

const MembershipsHistory = ( { translate, subscriptions, moment } ) => {
	let content;
	if ( subscriptions && subscriptions.length ) {
		content = (
			<>
				<SectionHeader label={ translate( 'Active payments plans' ) } />
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
					title={ translate( 'No payments found.' ) }
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
	subscriptions: getAllSubscriptions( state ),
} ) )( localize( withLocalizedMoment( MembershipsHistory ) ) );
