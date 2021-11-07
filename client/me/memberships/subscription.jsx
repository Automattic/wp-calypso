import { Card, CompactCard, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import titles from 'calypso/me/purchases/titles';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import { requestSubscriptionStop } from 'calypso/state/memberships/subscriptions/actions';
import {
	getSubscription,
	getStoppingStatus,
} from 'calypso/state/memberships/subscriptions/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { purchasesRoot } from '../purchases/paths';
import MembershipSiteHeader from './header';

import './subscription.scss';

function Subscription( { translate, subscription, moment, stoppingStatus } ) {
	const dispatch = useDispatch();

	const stopSubscription = () => dispatch( requestSubscriptionStop( subscription.ID ) );

	useEffect( () => {
		if ( stoppingStatus === 'fail' ) {
			// run is-error notice to contact support
			dispatch(
				errorNotice(
					translate(
						'There was a problem while stopping your subscription, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.',
						{
							components: {
								a: <a href={ CALYPSO_CONTACT } />,
								strong: <strong />,
							},
						}
					)
				)
			);
		} else if ( stoppingStatus === 'success' ) {
			// redirect back to Purchases list
			dispatch(
				successNotice(
					translate( 'This subscription has been canceled. You will no longer be charged.' ),
					{ displayOnNextPage: true }
				)
			);
			page( purchasesRoot );
		}
	}, [ stoppingStatus, dispatch, translate ] );

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
						onClick={ stopSubscription }
					>
						<Gridicon icon="trash" />
						{ translate( 'Stop %s subscription.', { args: subscription.title } ) }
					</CompactCard>
				</>
			) }
		</Main>
	);
}

export default connect( ( state, props ) => ( {
	subscription: getSubscription( state, props.subscriptionId ),
	stoppingStatus: getStoppingStatus( state, props.subscriptionId ),
} ) )( localize( withLocalizedMoment( Subscription ) ) );
