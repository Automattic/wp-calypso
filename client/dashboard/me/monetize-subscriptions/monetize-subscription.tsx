import {
	monetizeSubscriptionDisableAutoRenew,
	monetizeSubscriptionQuery,
	monetizeSubscriptionResumeAutoRenew,
	monetizeSubscriptionStop,
} from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, trash, replace, globe, chevronRight } from '@wordpress/icons';
import { formatDate } from 'date-fns';
import { useEffect } from 'react';
import { useNotice } from '../../app/hooks/use-notice';
import { monetizeSubscriptionRoute } from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getMonetizeSubscriptionsUrl } from '../../me/monetize-subscriptions/urls';

function MembershipSiteHeader( { name, domain }: { name: string; domain: string } ) {
	return (
		<Card>
			<Icon icon={ globe } />
			<div>
				<div>{ name }</div>
				<div>{ domain }</div>
			</div>
		</Card>
	);
}

export default function MonetizeSubscription() {
	const params = monetizeSubscriptionRoute.useParams();
	const subscriptionId: string = params.subscriptionId;

	const { data: subscription } = useQuery( monetizeSubscriptionQuery( subscriptionId ) );

	const { createSuccessNotice, createErrorNotice } = useNotice();

	const {
		mutate: stopSubscription,
		isError: stoppingStatusError,
		isLoading: isStopping,
		isSuccess: stoppingStatusSuccess,
	} = useMutation( monetizeSubscriptionStop( subscriptionId ) );

	const {
		mutate: disableAutoRenew,
		isError: disableAutoRenewError,
		isLoading: isDisablingAutoRenew,
	} = useMutation( monetizeSubscriptionDisableAutoRenew( subscriptionId ) );

	const {
		mutate: enableAutoRenew,
		isError: enableAutoRenewError,
		isLoading: isEnablingAutoRenew,
	} = useMutation( monetizeSubscriptionResumeAutoRenew( subscriptionId ) );

	const isRenewable = subscription && ( subscription.renew_interval || subscription.is_renewable ); // can remove renew_interval once backend is deployed
	const isAutoRenewing = isRenewable && subscription.renew_interval;
	const isProduct = subscription && ! isRenewable;
	const isDisabledAutorenewing = isRenewable && ! subscription.renew_interval;
	const isUpdating = isEnablingAutoRenew || isDisablingAutoRenew;

	const navigate = useNavigate();
	useEffect( () => {
		if ( stoppingStatusError || disableAutoRenewError || enableAutoRenewError ) {
			// run is-error notice to contact support
			if ( isProduct ) {
				createErrorNotice( __( 'There was a problem while removing your product.' ), {
					actions: [
						{
							url: CALYPSO_CONTACT,
							label: __( 'Please contact support' ),
						},
					],
				} );
			} else if ( stoppingStatusError ) {
				createErrorNotice( __( 'There was a problem while stopping your subscription.' ), {
					actions: [
						{
							url: CALYPSO_CONTACT,
							label: __( 'Please contact support' ),
						},
					],
				} );
			} else if ( disableAutoRenewError || enableAutoRenewError ) {
				createErrorNotice( __( 'There was a problem while updating your subscription.' ), {
					url: CALYPSO_CONTACT,
					label: __( 'Please contact support' ),
				} );
			}
		} else if ( stoppingStatusSuccess ) {
			// redirect back to Purchases list
			createSuccessNotice( __( 'This item has been removed.' ), { displayOnNextPage: true } );
			navigate( {
				to: getMonetizeSubscriptionsUrl(),
			} );
		}
	}, [
		stoppingStatusSuccess,
		stoppingStatusError,
		isProduct,
		enableAutoRenewError,
		disableAutoRenewError,
	] );

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader title={ isProduct ? __( 'Product Details' ) : __( 'Subscription Details' ) } />
			}
		>
			{ isStopping && (
				<Notice status="info">
					{ isProduct ? __( 'Removing this product' ) : __( 'Stopping this subscription' ) }
				</Notice>
			) }
			{ isUpdating && <Notice status="info">{ __( 'Updating subscription auto-renew' ) }</Notice> }
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
								{ formatCurrency(
									parseFloat( subscription.renewal_price ),
									subscription.currency
								) }
							</div>
						</div>
						<ul className="memberships__subscription-inner-meta">
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ __( 'Renew interval' ) }
								</em>
								<span className="memberships__subscription-inner-detail">
									{ subscription.renew_interval || '-' }
								</span>
							</li>
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ __( 'Subscribed On' ) }
								</em>
								<span className="memberships__subscription-inner-detail">
									{ formatDate( subscription.start_date, 'MMM dd, yyyy' ) }
								</span>
							</li>
							<li>
								<em className="memberships__subscription-inner-detail-label">
									{ isDisabledAutorenewing ? __( 'Expires on' ) : __( 'Renews on' ) }
								</em>
								<div className="memberships__subscription-inner-detail">
									{ subscription.end_date
										? formatDate( subscription.end_date, 'MMM dd, yyyy' )
										: __( 'Never Expires' ) }
								</div>
								{ ! isProduct && (
									<div className="memberships__subscription-inner-detail">
										{ subscription.renew_interval
											? __( 'Auto-renew is ON' )
											: __( 'Auto-renew is OFF' ) }
									</div>
								) }
							</li>
						</ul>
					</Card>
					{ isRenewable && (
						<Card
							tagName="button"
							className="auto-renew-toggle__card"
							onClick={ isAutoRenewing ? disableAutoRenew : enableAutoRenew }
							disabled={ isUpdating }
						>
							<Icon icon={ replace } />
							{ isAutoRenewing ? __( 'Disable auto-renew' ) : __( 'Enable auto-renew' ) }
							<Icon className="card__link-indicator" icon={ chevronRight } />
						</Card>
					) }
					<Card tagName="button" onClick={ stopSubscription }>
						<Icon icon={ trash } />
						{ isProduct
							? // eslint-disable-next-line @wordpress/i18n-translator-comments
							  sprintf( __( 'Remove %s product' ), subscription.title )
							: // eslint-disable-next-line @wordpress/i18n-translator-comments
							  sprintf( __( 'Stop %s subscription' ), subscription.title ) }
						<Icon className="card__link-indicator" icon={ chevronRight } />
					</Card>
				</>
			) }
		</PageLayout>
	);
}
