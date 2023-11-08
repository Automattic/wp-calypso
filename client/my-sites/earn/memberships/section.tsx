import { Card, Button, Dialog, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback, ReactNode } from 'react';
import paymentsImage from 'calypso/assets/images/earn/payments-illustration.svg';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SectionHeader from 'calypso/components/section-header';
import { preventWidows } from 'calypso/lib/formatting';
import { userCan } from 'calypso/lib/site/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getEarningsWithDefaultsForSiteId } from 'calypso/state/memberships/earnings/selectors';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { requestDisconnectSiteStripeAccount } from 'calypso/state/memberships/settings/actions';
import {
	getConnectedAccountIdForSiteId,
	getConnectedAccountDescriptionForSiteId,
	getConnectUrlForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CommissionFees from '../components/commission-fees';
import { Query } from '../types';
import {
	ADD_TIER_PLAN_HASH,
	OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH,
	LAUNCHPAD_HASH,
} from './constants';
import './style.scss';

type MembershipsSectionProps = {
	query?: Query;
};

function MembershipsSection( { query }: MembershipsSectionProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const source = getSource();
	const [ disconnectedConnectedAccountId, setDisconnectedConnectedAccountId ] = useState( null );

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
	);

	const products = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );

	const connectedAccountDescription = useSelector( ( state ) =>
		getConnectedAccountDescriptionForSiteId( state, site?.ID )
	);
	const connectUrl: string = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	const { commission } = useSelector( ( state ) =>
		getEarningsWithDefaultsForSiteId( state, site?.ID )
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
					connectedAccountId,
					translate( 'Please wait, disconnecting Stripe\u2026' ),
					translate( 'Stripe account is disconnected.' )
				)
			);
		}
		setDisconnectedConnectedAccountId( null );
	}

	function renderManagePlans() {
		if ( ! site ) {
			return <LoadingEllipsis />;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Manage plans' ) } />
				<Card href={ '/earn/payments-plans/' + site?.slug }>
					<QueryMembershipProducts siteId={ site.ID } />
					<div className="memberships__module-plans-content">
						<div className="memberships__module-plans-icon">
							<Gridicon size={ 24 } icon="credit-card" />
						</div>
						<div>
							<div className="memberships__module-plans-title">
								{ translate( 'Payment plans' ) }
							</div>
							<div className="memberships__module-plans-description">
								{ translate(
									'Single and recurring payments for goods, services, and subscriptions'
								) }
							</div>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	function renderSettings() {
		return (
			<div>
				<SectionHeader label={ translate( 'Settings' ) } />
				<Card
					onClick={ () => setDisconnectedConnectedAccountId( connectedAccountId ) }
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
				<Dialog
					isVisible={ !! disconnectedConnectedAccountId }
					buttons={ [
						{
							label: translate( 'Cancel' ),
							action: 'cancel',
						},
						{
							label: translate( 'Disconnect Payments from Stripe' ),
							isPrimary: true,
							action: 'disconnect',
						},
					] }
					onClose={ onCloseDisconnectStripeAccount }
				>
					<h1>{ translate( 'Confirmation' ) }</h1>
					<p>{ translate( 'Do you want to disconnect Payments from your Stripe account?' ) }</p>
					<Notice
						text={ translate(
							'Once you disconnect Payments from Stripe, new subscribers won’t be able to sign up and existing subscriptions will stop working.'
						) }
						showDismiss={ false }
					/>
				</Dialog>
			</div>
		);
	}

	function renderStripeConnected() {
		return (
			<div>
				{ renderNotices() }
				{ renderManagePlans() }
				{ renderSettings() }
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
				! siteHasPlans && (
					<Notice status="is-success" showDismiss={ false } text={ congratsText }>
						<NoticeAction href={ `/earn/payments-plans/${ site?.slug }` } icon="create">
							{ translate( 'Add a payment plan' ) }
						</NoticeAction>
					</Notice>
				)
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
						href={ `/earn/payments-plans/${ site?.slug }${ ADD_NEWSLETTER_PAYMENT_PLAN_HASH }` }
					>
						{ translate( 'Add payments' ) }
					</NoticeAction>
				</Notice>
			);
		}

		return null;
	}

	function renderOnboarding( cta: ReactNode, intro?: ReactNode | null ) {
		return (
			<Card>
				<div className="memberships__onboarding-wrapper">
					<div className="memberships__onboarding-column-info">
						<h2 className="memberships__onboarding-header">
							{ preventWidows( translate( 'Accept payments on your website.' ) ) }
						</h2>
						<p className="memberships__onboarding-paragraph">
							{ preventWidows(
								translate(
									'Our payments blocks make it easy to add a buy button for digital goods or services, collect donations via a form, or limit access for specific content to subscribers-only.'
								)
							) }
						</p>
						<p className="memberships__onboarding-paragraph">
							{ preventWidows(
								translate(
									'The Payment Button, Donations Form, and Premium Content blocks all require you to first connect your bank account details with our secure payment processor, Stripe.',
									{
										components: {
											link: (
												<a
													href={ localizeUrl(
														'https://wordpress.com/support/wordpress-editor/blocks/payments/#setting-up-payments'
													) }
												/>
											),
										},
									}
								)
							) }
						</p>
						{ intro ? <p className="memberships__onboarding-paragraph">{ intro }</p> : null }
						<p className="memberships__onboarding-paragraph">{ cta }</p>
						<p className="memberships__onboarding-paragraph memberships__onboarding-paragraph-disclaimer">
							<em>
								{ preventWidows(
									translate(
										'All credit and debit card payments made through these blocks are securely and seamlessly processed by Stripe.'
									)
								) }
							</em>
						</p>
					</div>
					<div className="memberships__onboarding-column-image">
						<img src={ paymentsImage } aria-hidden="true" alt="" />
					</div>
				</div>
				<div className="memberships__onboarding-benefits">
					<div>
						<h3>{ translate( 'No plugin required' ) }</h3>
						{ preventWidows(
							translate(
								'No additional installs or purchases. Simply connect your banking details with our payment processor, Stripe, and insert a block to get started.'
							)
						) }
					</div>
					<div>
						<h3>{ translate( 'One-time and recurring options' ) }</h3>
						{ preventWidows(
							translate(
								'Accept one-time, monthly, and yearly payments from your visitors. This is perfect for a single purchase or tip — or a recurring donation, membership fee, or subscription.'
							)
						) }
					</div>
					<div>
						<h3>{ translate( 'Simple fees structure' ) }</h3>
						<p>
							<CommissionFees commission={ commission } siteSlug={ site?.slug } />
						</p>
						<p>{ preventWidows( translate( 'No fixed monthly or annual fees charged.' ) ) }</p>
					</div>
					<div>
						<h3>{ translate( 'Join thousands of others' ) }</h3>
						{ preventWidows(
							translate(
								'Sites that actively promoted their businesses and causes on social media, email, and other platforms have collected tens of thousands of dollars through these blocks.'
							)
						) }
					</div>
				</div>
			</Card>
		);
	}

	function renderConnectStripe() {
		return (
			<div>
				{ query?.stripe_connect_cancelled && (
					<Notice
						showDismiss={ false }
						text={ translate(
							'The attempt to connect to Stripe has been cancelled. You can connect again at any time.'
						) }
					/>
				) }
				{ renderOnboarding(
					<Button
						primary={ true }
						href={ connectUrl }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_memberships_stripe_connect_click' ) )
						}
					>
						{ translate( 'Connect Stripe to Get Started' ) }{ ' ' }
						<Gridicon size={ 18 } icon="external" />
					</Button>,
					connectedAccountDescription
						? translate( 'Previously connected to Stripe account %(connectedAccountDescription)s', {
								args: {
									connectedAccountDescription: connectedAccountDescription,
								},
						  } )
						: null
				) }
			</div>
		);
	}

	useEffect( () => {
		navigateToLaunchpad();
	}, [ navigateToLaunchpad ] );

	if ( ! userCan( 'manage_options', site ) ) {
		return renderOnboarding(
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
			{ connectedAccountId && renderStripeConnected() }
			{ connectUrl && renderConnectStripe() }

			{ ! connectedAccountId && ! connectUrl && (
				<div className="earn__payments-loading">
					<LoadingEllipsis />
				</div>
			) }
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
