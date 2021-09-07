import { Card, CompactCard } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import FormattedHeader from 'calypso/components/formatted-header';
import Gridicon from 'calypso/components/gridicon';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import titles from 'calypso/me/purchases/titles';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import { requestSubscriptionStop } from 'calypso/state/memberships/subscriptions/actions';
import {
	getSubscription,
	getStoppingStatus,
} from 'calypso/state/memberships/subscriptions/selectors';
import { purchasesRoot } from '../purchases/paths';
import MembershipSiteHeader from './header';

import './subscription.scss';

class Subscription extends React.Component {
	stopSubscription = () => this.props.requestSubscriptionStop( this.props.subscription.ID );

	render() {
		const { translate, subscription, moment, stoppingStatus } = this.props;

		return (
			<Main wideLayout className="memberships__subscription">
				<DocumentHead title={ translate( 'Subscription Details' ) } />
				<MeSidebarNavigation />
				<QueryMembershipsSubscriptions />
				<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
				<HeaderCake backHref={ purchasesRoot }>{ translate( 'Subscription Details' ) }</HeaderCake>
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
					<>
						<Card className="memberships__subscription-meta">
							<MembershipSiteHeader
								name={ subscription.site_title }
								domain={ subscription.site_url }
							/>
							<div className="memberships__subscription-header">
								<div className="memberships__subscription-title">{ subscription.title }</div>
								<div className="memberships__subscription-price">
									{ formatCurrency( subscription.renewal_price, subscription.currency ) }
								</div>
							</div>
							<ul className="memberships__subscription-inner-meta">
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
						</Card>
						<CompactCard
							tagName="button"
							className="memberships__subscription-remove"
							onClick={ this.stopSubscription }
						>
							<Gridicon icon="trash" />
							{ translate( 'Stop %s subscription.', { args: subscription.title } ) }
						</CompactCard>
					</>
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
