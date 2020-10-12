/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card, CompactCard } from '@automattic/components';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import HeaderCake from 'calypso/components/header-cake';
import { purchasesRoot } from '../purchases/paths';
import Site from 'calypso/blocks/site';
import Gridicon from 'calypso/components/gridicon';
import { requestSubscriptionStop } from 'calypso/state/memberships/subscriptions/actions';
import Notice from 'calypso/components/notice';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import {
	getSubscription,
	getStoppingStatus,
} from 'calypso/state/memberships/subscriptions/selectors';

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
											{ subscription.renew_interval || '-' }
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
											{ subscription.end_date
												? moment( subscription.end_date ).format( 'll' )
												: translate( 'Never Expires' ) }
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

export default connect(
	( state, props ) => ( {
		subscription: getSubscription( state, props.subscriptionId ),
		stoppingStatus: getStoppingStatus( state, props.subscriptionId ),
	} ),
	{
		requestSubscriptionStop,
	}
)( localize( withLocalizedMoment( Subscription ) ) );
