import { Badge, Card, Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SectionHeader from 'calypso/components/section-header';
import { userCan } from 'calypso/lib/site/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getEarningsWithDefaultsForSiteId } from 'calypso/state/memberships/earnings/selectors';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { requestDisconnectSiteStripeAccount } from 'calypso/state/memberships/settings/actions';
import {
	getConnectedAccountDescriptionForSiteId,
	getConnectUrlForSiteId,
	getMembershipsSandboxStatusForSiteId,
	getCouponsAndGiftsEnabledForSiteId,
	getIsConnectedForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CommissionFees from '../components/commission-fees';
import { Query } from '../types';
import {
	ADD_TIER_PLAN_HASH,
	OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH,
	LAUNCHPAD_HASH,
} from './constants';
import CouponList from './coupons-list';
import ProductList from './products-list';
import './style.scss';

type MembershipsSectionProps = {
	query?: Query;
};

function MembershipsSection( { query }: MembershipsSectionProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const source = getSource();

	const site = useSelector( getSelectedSite );

	const hasConnectedAccount = useSelector( ( state ) =>
		getIsConnectedForSiteId( state, site?.ID )
	);

	const isMembershipsSandboxed = useSelector( ( state ) =>
		getMembershipsSandboxStatusForSiteId( state, site?.ID )
	);

	const [ showDisconnectStripeDialog, setShowDisconnectStripeDialog ] = useState( false );

	const products = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );

	const connectedAccountDescription = useSelector( ( state ) =>
		getConnectedAccountDescriptionForSiteId( state, site?.ID )
	);
	const connectUrl: string = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	const { commission } = useSelector( ( state ) =>
		getEarningsWithDefaultsForSiteId( state, site?.ID )
	);

	const couponsAndGiftsEnabled = useSelector( ( state ) =>
		getCouponsAndGiftsEnabledForSiteId( state, site?.ID )
	);

	const navigateToLaunchpad = useCallback( () => {
		const shouldGoToLaunchpad = query?.stripe_connect_success === 'launchpad';
		const siteIntent = site?.options?.site_intent;
		if ( shouldGoToLaunchpad ) {
			window.location.assign( `/setup/${ siteIntent }/launchpad?siteSlug=${ site?.slug }` );
		}
	}, [ query, site ] );

	function onCloseDisconnectStripeAccount( reason: string | undefined ) {
		if ( reason === 'disconnect' ) {
			dispatch(
				requestDisconnectSiteStripeAccount(
					site?.ID,
					translate( 'Please wait, disconnecting Stripe\u2026' ),
					translate( 'Stripe account is disconnected.' )
				)
			);
		}
		setShowDisconnectStripeDialog( false );
	}

	function renderSettings() {
		return (
			<div>
				<SectionHeader label={ translate( 'Settings' ) }>
					{ isMembershipsSandboxed === 'sandbox' && (
						<Badge
							type="warning"
							className={ `memberships__settings-sandbox-warning${
								! hasConnectedAccount ? ' stripe-disconnected' : ''
							}` }
						>
							{ translate( 'Memberships Sandbox Active' ) }
						</Badge>
					) }
					{ ! hasConnectedAccount && (
						<Button
							primary
							compact
							href={ connectUrl }
							onClick={ () =>
								dispatch( recordTracksEvent( 'calypso_memberships_stripe_connect_click' ) )
							}
						>
							{ translate( 'Connect Stripe' ) }
						</Button>
					) }
				</SectionHeader>
				{ hasConnectedAccount ? (
					<Card
						onClick={ () => setShowDisconnectStripeDialog( true ) }
						className="memberships__settings-link"
					>
						<div className="memberships__module-plans-content">
							<div className="memberships__module-plans-icon">
								<Gridicon size={ 24 } icon="link-break" />
							</div>
							<div>
								<div className="memberships__module-settings-title">
									{ translate( 'Disconnect Stripe Account' ) }
								</div>
								{ connectedAccountDescription ? (
									<div className="memberships__module-settings-description">
										{ translate( 'Connected to %(connectedAccountDescription)s', {
											args: {
												connectedAccountDescription: connectedAccountDescription,
											},
										} ) }
									</div>
								) : null }
							</div>
						</div>
					</Card>
				) : (
					<Card className="memberships__settings-link">
						<div className="memberships__module-plans-content">
							<div>
								<div className="memberships__module-plans-title">
									{ translate( 'Connect a Stripe account to start collecting payments.' ) }
								</div>
								{ connectedAccountDescription ? (
									<div className="memberships__module-plans-title">
										{ translate(
											'Previously connected to Stripe account %(connectedAccountDescription)s',
											{
												args: {
													connectedAccountDescription: connectedAccountDescription,
												},
											}
										) }
									</div>
								) : null }
							</div>
						</div>
					</Card>
				) }
				<p className="memberships__commission-notice">
					<CommissionFees commission={ commission } siteSlug={ site?.slug } />
				</p>
				<Dialog
					className="memberships__stripe-disconnect-modal"
					isVisible={ showDisconnectStripeDialog }
					buttons={ [
						{
							label: translate( 'Cancel' ),
							action: 'cancel',
						},
						{
							label: translate( 'Disconnect Payments from Stripe' ),
							isPrimary: true,
							additionalClassNames: 'is-scary',
							action: 'disconnect',
						},
					] }
					onClose={ onCloseDisconnectStripeAccount }
				>
					<h1>{ translate( 'Disconnect Stripe?' ) }</h1>
					<p>
						{ translate(
							'Once you disconnect Payments from Stripe, new subscribers won’t be able to sign up and existing subscriptions will stop working.'
						) }
					</p>
				</Dialog>
			</div>
		);
	}

	function renderNotices() {
		const stripe_connect_success = query?.stripe_connect_success;

		if ( stripe_connect_success === 'earn' ) {
			const siteHasPlans = products.length !== 0;

			let congratsText;
			if ( ! siteHasPlans ) {
				congratsText = translate(
					'Congrats! Your site is now connected to Stripe. You can now add your first payment plan.'
				);
			} else {
				congratsText = translate( 'Congrats! Your site is now connected to Stripe.' );
			}

			return (
				<Notice status="is-success" showDismiss={ false } text={ congratsText }>
					<NoticeAction href={ `/earn/payments/${ site?.slug }` } icon="create">
						{ translate( 'Add a payment plan' ) }
					</NoticeAction>
				</Notice>
			);
		}

		if ( stripe_connect_success === 'earn-newsletter' ) {
			return (
				<Notice
					status="is-success"
					showDismiss={ false }
					text={ translate(
						'Congrats! Your site is now connected to Stripe. You can now add payments to your newsletter.'
					) }
				>
					<NoticeAction
						external
						icon="create"
						href={ `/earn/payments/${ site?.slug }${ ADD_TIER_PLAN_HASH }` }
					>
						{ translate( 'Add tiers' ) }
					</NoticeAction>
				</Notice>
			);
		}

		if ( query?.stripe_connect_cancelled ) {
			return (
				<Notice
					showDismiss={ false }
					text={ translate(
						'The attempt to connect to Stripe has been cancelled. You can connect again at any time.'
					) }
				/>
			);
		}

		return null;
	}

	useEffect( () => {
		navigateToLaunchpad();
	}, [ navigateToLaunchpad ] );

	if ( ! userCan( 'manage_options', site ) ) {
		return (
			<Notice
				status="is-warning"
				text={ translate( 'Only site administrators can edit Payments settings.' ) }
				showDismiss={ false }
			/>
		);
	}

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<div>
			<QueryMembershipsSettings siteId={ site.ID } source={ source } />
			<QueryMembershipsEarnings siteId={ site?.ID ?? 0 } />
			{ ! hasConnectedAccount && ! connectUrl && (
				<div className="earn__payments-loading">
					<LoadingEllipsis />
				</div>
			) }
			<div>
				{ renderNotices() }
				<ProductList />
				{ couponsAndGiftsEnabled && <CouponList /> }
				{ renderSettings() }
			</div>
		</div>
	);
}

/**
 * Source is used to add data to the Stripe Connect URL. On a successful
 * connection, this source is used to redirect the user the appropriate place.
 */
function getSource() {
	if (
		window.location.hash === OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH ||
		window.location.hash === ADD_TIER_PLAN_HASH
	) {
		return 'earn-newsletter';
	}
	if ( window.location.hash === LAUNCHPAD_HASH ) {
		return 'full-launchpad';
	}
	return 'calypso';
}

export default MembershipsSection;
