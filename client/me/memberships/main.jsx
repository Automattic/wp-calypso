/** @format */
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
import CompactCard from 'components/card/compact';

/**
 * Style dependencies
 */
import './main.scss';

const MembershipItem = ( { translate, subscription, moment } ) => (
	<CompactCard key={ subscription.ID } href={ '/me/purchases/memberships/' + subscription.ID }>
		<div className="memberships__list-subscription">
			<div className="memberships__list-date">
				<div>{ moment( subscription.end_date ).format( 'll' ) }</div>
				<div className="memberships__list-sub">
					{ translate( 'Renews %s', { args: moment( subscription.end_date ).fromNow() } ) }
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
					{ translate( 'Every %s', { args: subscription.renew_interval } ) }
				</div>
			</div>
		</div>
	</CompactCard>
);

const MembershipsHistory = ( { translate, subscriptions, moment } ) => (
	<Main className="memberships">
		<DocumentHead title={ translate( 'My Memberships' ) } />
		<PageViewTracker path="/me/purchases/memberships" title="Me > My Memberships" />
		<MeSidebarNavigation />
		<QueryMembershipsSubscriptions />
		<PurchasesHeader section={ 'memberships' } />
		<SectionHeader label={ translate( 'Active Membership plans' ) } />
		{ subscriptions &&
			subscriptions.map(
				subscription => (
					<MembershipItem
						key={ subscription.ID }
						translate={ translate }
						subscription={ subscription }
						moment={ moment }
					/>
				),
				this
			) }
	</Main>
);

export default connect( state => ( {
	subscriptions: get( state, 'memberships.subscriptions.items', [] ),
} ) )( localize( MembershipsHistory ) );
