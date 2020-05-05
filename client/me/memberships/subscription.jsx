/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card, CompactCard } from '@automattic/components';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import QueryMembershipsSubscriptions from 'components/data/query-memberships-subscriptions';
import HeaderCake from 'components/header-cake';
import { purchasesRoot } from '../purchases/paths';
import Site from 'blocks/site';
import Gridicon from 'components/gridicon';
import { requestSubscriptionStop } from 'state/memberships/subscriptions/actions';
import Notice from 'components/notice';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './subscription.scss';

class Subscription extends React.Component {
	stopSubscription = () => this.props.requestSubscriptionStop( this.props.subscription.ID );

	render() {
		const { translate, subscription, moment, stoppingStatus } = this.props;
		return (
			<Main className="memberships__subscription">
				<DocumentHead title={ translate( 'Other Sites' ) } />
				<MeSidebarNavigation />
				<QueryMembershipsSubscriptions />
				<PurchasesHeader section={ 'memberships' } />
				<HeaderCake backHref={ purchasesRoot + '/other' }>
					{ subscription ? subscription.title : translate( 'All subscriptions' ) }
				</HeaderCake>
				{ stoppingStatus === 'start' && (
					<Notice
						status="is-info"
						isLoading={ true }
						text={ translate( 'Stopping this subscription' ) }
					/>
				) }
				{ stoppingStatus === 'fail' && (
					<Notice
						status="is-error"
						text={ translate( 'There was a problem while stopping your subscription' ) }
					/>
				) }
				{ stoppingStatus === 'success' && (
					<Notice
						status="is-success"
						text={ translate( 'This subscription has been stopped. You will not be charged.' ) }
					/>
				) }

				{ subscription && (
					<div>
						<Card className="memberships__subscription-meta">
							<Site siteId={ parseInt( subscription.site_id ) } href={ subscription.site_url } />
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
											{ translate( 'Subscribed On' ) }
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
						<CompactCard
							tagName="button"
							className="memberships__subscription-remove"
							onClick={ this.stopSubscription }
						>
							<Gridicon icon="trash" />
							{ translate( 'Stop %s subscription.', { args: subscription.title } ) }
						</CompactCard>
					</div>
				) }
			</Main>
		);
	}
}

const getSubscription = ( state, subscriptionId ) =>
	get( state, 'memberships.subscriptions.items', [] )
		.filter( ( sub ) => sub.ID === subscriptionId )
		.pop();

export default connect(
	( state, props ) => ( {
		subscription: getSubscription( state, props.subscriptionId ),
		stoppingStatus: get(
			state,
			[ 'memberships', 'subscriptions', 'stoppingSubscription', props.subscriptionId ],
			false
		),
	} ),
	{
		requestSubscriptionStop,
	}
)( localize( withLocalizedMoment( Subscription ) ) );
