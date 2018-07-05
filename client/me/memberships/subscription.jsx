/** @format */
/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import QueryMembershipsSubscriptions from 'components/data/query-memberships-subscriptions';
import formatCurrency from 'lib/format-currency';
import HeaderCake from 'components/header-cake';
import { purchasesRoot } from '../purchases/paths';
import Site from 'blocks/site';

const Subscription = ( { translate, subscription, moment } ) => (
	<Main className="memberships__subscription">
		<DocumentHead title={ translate( 'My Memberships' ) } />
		<MeSidebarNavigation />
		<QueryMembershipsSubscriptions />
		<PurchasesHeader section={ 'memberships' } />
		{ subscription && (
			<div>
				<HeaderCake backHref={ purchasesRoot + '/memberships' }>{ subscription.title }</HeaderCake>
				<Card className="memberships__subscription-meta">
					<Site siteId={ subscription.site_id } href={ subscription.site_url } />
					<div className="memberships__subscription-title">{ subscription.title }</div>
					<Fragment>
						<ul className="memberships__subscription-inner-meta">
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ translate( 'Price' ) }
								</em>
								<span className="memberships__subscription-inner-detail">
									{ formatCurrency( subscription.renewal_price, subscription.currency ) }
								</span>
							</li>
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ translate( 'Renew interval' ) }
								</em>
								<span className="memberships__subscription-inner-detail">
									{ subscription.renew_interval }
								</span>
							</li>
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ translate( 'Subscribed on' ) }
								</em>
								<span className="memberships__subscription-inner-detail">
									{ moment( subscription.start_date ).format( 'll' ) }
								</span>
							</li>
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ translate( 'Renews on' ) }
								</em>
								<span className="memberships__subscription-inner-detail">
									{ moment( subscription.end_date ).format( 'll' ) }
								</span>
							</li>
						</ul>
					</Fragment>
				</Card>
			</div>
		) }
	</Main>
);
const getSubscription = ( state, subscriptionId ) =>
	get( state, 'memberships.subscriptions.items', [] )
		.filter( sub => sub.ID === subscriptionId )
		.pop();

export default connect( ( state, props ) => ( {
	subscription: getSubscription( state, props.subscriptionId ),
} ) )( localize( Subscription ) );
