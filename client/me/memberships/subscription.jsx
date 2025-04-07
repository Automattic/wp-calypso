/* eslint-disable wpcalypso/jsx-classname-namespace */
import page from '@automattic/calypso-router';
import { Card, CompactCard, Gridicon, MaterialIcon } from '@automattic/components';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { formatCurrency, localize } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import titles from 'calypso/me/purchases/titles';
import {
	requestAutoRenewDisable,
	requestAutoRenewResume,
	requestSubscriptionStop,
} from 'calypso/state/memberships/subscriptions/actions';
import {
	getSubscription,
	getStoppingStatus,
	getUpdatingStatus,
} from 'calypso/state/memberships/subscriptions/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { purchasesRoot } from '../purchases/paths';
import MembershipSiteHeader from './header';

import './subscription.scss';

function Subscription( { translate, subscription, moment, stoppingStatus, updatingStatus } ) {
	const dispatch = useDispatch();

	const isStopping = stoppingStatus === 'start';
	const isUpdating = updatingStatus === 'start';
	const isProcessing = isStopping || isUpdating;
	const stopSubscription = () =>
		dispatch( ! isProcessing && requestSubscriptionStop( subscription.ID ) );
	const disableAutoRenew = () =>
		dispatch( ! isProcessing && requestAutoRenewDisable( subscription.ID ) );
	const enableAutoRenew = () =>
		dispatch( ! isProcessing && requestAutoRenewResume( subscription.ID ) );
	const isRenewable = subscription && ( subscription.renew_interval || subscription.is_renewable ); // can remove renew_interval once backend is deployed
	const isAutoRenewing = isRenewable && subscription.renew_interval;
	const isProduct = subscription && ! isRenewable;
	const isDisabledAutorenewing = isRenewable && ! subscription.renew_interval;

	useEffect( () => {
		if ( stoppingStatus === 'fail' || updatingStatus === 'fail' ) {
			// run is-error notice to contact support
			if ( isProduct ) {
				dispatch(
					errorNotice(
						translate(
							'There was a problem while removing your product, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.',
							{
								components: {
									a: <a href={ CALYPSO_CONTACT } />,
									strong: <strong />,
								},
							}
						)
					)
				);
			} else if ( stoppingStatus === 'fail' ) {
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
			} else if ( updatingStatus === 'fail' ) {
				dispatch(
					errorNotice(
						translate(
							'There was a problem while updating your subscription, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.',
							{
								components: {
									a: <a href={ CALYPSO_CONTACT } />,
									strong: <strong />,
								},
							}
						)
					)
				);
			}
		} else if ( stoppingStatus === 'success' ) {
			// redirect back to Purchases list
			dispatch(
				successNotice( translate( 'This item has been removed.' ), { displayOnNextPage: true } )
			);
			page( purchasesRoot );
		}
	}, [ stoppingStatus, updatingStatus, dispatch, translate, isProduct ] );

	return (
		<Main wideLayout className="manage-purchase memberships__subscription">
			<DocumentHead
				title={ isProduct ? translate( 'Product Details' ) : translate( 'Subscription Details' ) }
			/>
			<QueryMembershipsSubscriptions />
			<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
			<HeaderCake backHref={ purchasesRoot }>
				{ isProduct ? translate( 'Product Details' ) : translate( 'Subscription Details' ) }
			</HeaderCake>
			{ isStopping && (
				<Notice
					status="is-info"
					isLoading
					text={
						isProduct
							? translate( 'Removing this product' )
							: translate( 'Stopping this subscription' )
					}
				/>
			) }
			{ isUpdating && (
				<Notice
					status="is-info"
					isLoading
					text={ translate( 'Updating subscription auto-renew' ) }
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
									{ isDisabledAutorenewing ? translate( 'Expires on' ) : translate( 'Renews on' ) }
								</em>
								<div className="memberships__subscription-inner-detail">
									{ subscription.end_date
										? moment( subscription.end_date ).format( 'll' )
										: translate( 'Never Expires' ) }
								</div>
								{ ! isProduct && (
									<div className="memberships__subscription-inner-detail">
										{ subscription.renew_interval
											? translate( 'Auto-renew is ON' )
											: translate( 'Auto-renew is OFF' ) }
									</div>
								) }
							</li>
						</ul>
					</Card>
					{ isRenewable && (
						<CompactCard
							tagName="button"
							className="auto-renew-toggle__card"
							onClick={ isAutoRenewing ? disableAutoRenew : enableAutoRenew }
							disabled={ isUpdating }
						>
							<MaterialIcon icon="autorenew" className="card__icon" />
							{ isAutoRenewing
								? translate( 'Disable auto-renew' )
								: translate( 'Enable auto-renew' ) }
							<Gridicon className="card__link-indicator" icon="chevron-right" />
						</CompactCard>
					) }
					<CompactCard
						tagName="button"
						className="remove-purchase__card"
						onClick={ stopSubscription }
					>
						<MaterialIcon icon="delete" className="card__icon" />
						{ isProduct
							? translate( 'Remove %s product', { args: subscription.title } )
							: translate( 'Stop %s subscription', { args: subscription.title } ) }
						<Gridicon className="card__link-indicator" icon="chevron-right" />
					</CompactCard>
				</>
			) }
		</Main>
	);
}

export default connect( ( state, props ) => ( {
	subscription: getSubscription( state, props.subscriptionId ),
	stoppingStatus: getStoppingStatus( state, props.subscriptionId ),
	updatingStatus: getUpdatingStatus( state, props.subscriptionId ),
} ) )( localize( withLocalizedMoment( Subscription ) ) );
