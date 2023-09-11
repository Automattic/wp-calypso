import { Card, Button, Dialog, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { englishLocales, localizeUrl } from '@automattic/i18n-utils';
import { saveAs } from 'browser-filesaver';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { orderBy } from 'lodash';
import { useState, useEffect, useCallback } from 'react';
import { shallowEqual } from 'react-redux';
import paymentsImage from 'calypso/assets/images/earn/payments-illustration.svg';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import Gravatar from 'calypso/components/gravatar';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
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
import {
	requestSubscribers,
	requestSubscriptionStop,
} from 'calypso/state/memberships/subscribers/actions';
import {
	getTotalSubscribersForSiteId,
	getOwnershipsForSiteId,
} from 'calypso/state/memberships/subscribers/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CommissionFees from '../components/commission-fees';
import {
	ADD_NEWSLETTER_PAYMENT_PLAN_HASH,
	LAUNCHPAD_HASH,
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
} from './constants';

import './style.scss';

function MembershipsSection( { query } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const source = getSource();
	const [ cancelledSubscriber, setCancelledSubscriber ] = useState( null );
	const [ disconnectedConnectedAccountId, setDisconnectedConnectedAccountId ] = useState( null );

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const subscribers = useSelector(
		( state ) => getOwnershipsForSiteId( state, site?.ID ),
		shallowEqual
	);

	const totalSubscribers = useSelector( ( state ) =>
		getTotalSubscribersForSiteId( state, site?.ID )
	);

	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
	);
	const connectedAccountDescription = useSelector( ( state ) =>
		getConnectedAccountDescriptionForSiteId( state, site?.ID )
	);
	const connectUrl = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	const {
		commission,
		currency,
		forecast,
		last_month: lastMonth,
		total,
	} = useSelector( ( state ) => getEarningsWithDefaultsForSiteId( state, site?.ID ) );

	const products = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );

	const navigateToLaunchpad = useCallback( () => {
		const shouldGoToLaunchpad = query?.stripe_connect_success === 'launchpad';
		const siteIntent = site?.options?.site_intent;
		if ( shouldGoToLaunchpad ) {
			window.location.assign( `/setup/${ siteIntent }/launchpad?siteSlug=${ site?.slug }` );
		}
	}, [ query, site ] );

	function renderEarnings() {
		return (
			<div>
				<SectionHeader label={ translate( 'Earnings' ) } />
				<QueryMembershipsEarnings siteId={ site?.ID } />
				<Card>
					<div className="memberships__module-content module-content">
						<ul className="memberships__earnings-breakdown-list">
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Total earnings', { context: 'Sum of earnings' } ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									{ formatCurrency( total, currency ) }
								</span>
							</li>
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Last 30 days', { context: 'Sum of earnings over last 30 days' } ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									{ formatCurrency( lastMonth, currency ) }
								</span>
							</li>
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Next month', {
										context: 'Forecast for the subscriptions due in the next 30 days',
									} ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									{ formatCurrency( forecast, currency ) }
								</span>
							</li>
						</ul>
					</div>
					<CommissionFees
						commission={ commission }
						iconSize={ 12 }
						siteSlug={ site?.slug }
						className="memberships__earnings-breakdown-notes"
					/>
				</Card>
			</div>
		);
	}

	const fetchNextSubscriberPage = useCallback(
		( force ) => {
			const fetched = Object.keys( subscribers ).length;
			if ( fetched < totalSubscribers || force ) {
				dispatch( requestSubscribers( site?.ID, fetched ) );
			}
		},
		[ dispatch, site, subscribers, totalSubscribers ]
	);

	function onCloseDisconnectStripeAccount( reason ) {
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

	function onCloseCancelSubscription( reason ) {
		if ( reason === 'cancel' ) {
			dispatch(
				requestSubscriptionStop(
					site?.ID,
					cancelledSubscriber,
					getIntervalDependantWording( cancelledSubscriber ).success
				)
			);
		}
		setCancelledSubscriber( null );
	}

	function downloadSubscriberList( event ) {
		event.preventDefault();
		const fileName = [ site?.slug, 'memberships', 'subscribers' ].join( '_' ) + '.csv';

		const csvData = [
			[
				'ID',
				'status',
				'start_date',
				'end_date',
				'user_name',
				'user_email',
				'plan_id',
				'plan_title',
				'renewal_price',
				'currency',
				'renew_interval',
				'All time total',
			]
				.map( ( field ) => '"' + field + '"' )
				.join( ',' ),
		]
			.concat(
				Object.values( subscribers ).map( ( row ) =>
					[
						row.id,
						row.status,
						row.start_date,
						row.end_date,
						row.user.name,
						row.user.user_email,
						row.plan.connected_account_product_id,
						row.plan.title,
						row.plan.renewal_price,
						row.plan.currency,
						row.renew_interval,
						row.all_time_total,
					]
						.map( ( field ) => ( field ? '"' + field + '"' : '""' ) )
						.join( ',' )
				)
			)
			.join( '\n' );

		const blob = new window.Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

		saveAs( blob, fileName );
	}

	function renderSubscriberList() {
		const wording = getIntervalDependantWording( cancelledSubscriber );
		return (
			<div>
				<SectionHeader label={ translate( 'Customers and Subscribers' ) } />
				{ Object.values( subscribers ).length === 0 && (
					<Card>
						{ translate( "You haven't added any customers. {{a}}Learn more{{/a}} about payments.", {
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/wordpress-editor/blocks/payments/'
										) }
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
							},
						} ) }
					</Card>
				) }
				{ Object.values( subscribers ).length > 0 && (
					<Card>
						<div className="memberships__module-content module-content">
							<div>
								{ orderBy( Object.values( subscribers ), [ 'id' ], [ 'desc' ] ).map( ( sub ) =>
									renderSubscriber( sub )
								) }
							</div>
							<InfiniteScroll nextPageMethod={ () => fetchNextSubscriberPage( false ) } />
						</div>
						<Dialog
							isVisible={ !! cancelledSubscriber }
							buttons={ [
								{
									label: translate( 'Back' ),
									action: 'back',
								},
								{
									label: wording.button,
									isPrimary: true,
									action: 'cancel',
								},
							] }
							onClose={ onCloseCancelSubscription }
						>
							<h1>{ translate( 'Confirmation' ) }</h1>
							<p>{ wording.confirmation_subheading }</p>
							<Notice text={ wording.confirmation_info } showDismiss={ false } />
						</Dialog>
						<div className="memberships__module-footer">
							<Button onClick={ downloadSubscriberList }>
								{ translate( 'Download list as CSV' ) }
							</Button>
						</div>
					</Card>
				) }
			</div>
		);
	}

	function getIntervalDependantWording( subscriber ) {
		const subscriber_email = subscriber?.user.user_email ?? '';
		const plan_name = subscriber?.plan.title ?? '';

		if ( subscriber?.plan?.renew_interval === PLAN_ONE_TIME_FREQUENCY ) {
			return {
				button: translate( 'Remove payment' ),
				confirmation_subheading: translate( 'Do you want to remove this payment?' ),
				confirmation_info: translate(
					'Removing this payment means that the user %(subscriber_email)s will no longer have access to any service granted by the %(plan_name)s plan. The payment will not be refunded.',
					{ args: { subscriber_email, plan_name } }
				),
				success: translate( 'Payment removed for %(subscriber_email)s.', {
					args: { subscriber_email },
				} ),
			};
		}
		return {
			button: translate( 'Cancel payment' ),
			confirmation_subheading: translate( 'Do you want to cancel this payment?' ),
			confirmation_info: translate(
				'Cancelling this payment means that the user %(subscriber_email)s will no longer have access to any service granted by the %(plan_name)s plan. Payments already made will not be refunded but any scheduled future payments will not be made.',
				{ args: { subscriber_email, plan_name } }
			),
			success: translate( 'Payment cancelled for %(subscriber_email)s.', {
				args: { subscriber_email },
			} ),
		};
	}

	function renderManagePlans() {
		return (
			<div>
				<SectionHeader label={ translate( 'Manage plans' ) } />
				<Card href={ '/earn/payments-plans/' + site?.slug }>
					<QueryMembershipProducts siteId={ site?.ID } />
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

	function renderSubscriberSubscriptionSummary( subscriber ) {
		const title = subscriber.plan.title ? ` (${ subscriber.plan.title }) ` : ' ';
		if ( subscriber.plan.renew_interval === PLAN_ONE_TIME_FREQUENCY ) {
			/* translators: Information about a one-time payment made by a subscriber to a site owner.
				%(amount)s - the amount paid,
				%(formattedDate) - the date it was paid
				%(title) - description of the payment plan, or a blank space if no description available. */
			return translate( 'Paid %(amount)s once on %(formattedDate)s%(title)s', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
					formattedDate: moment( subscriber.start_date ).format( 'll' ),
					title,
				},
			} );
		} else if ( subscriber.plan.renew_interval === PLAN_YEARLY_FREQUENCY ) {
			/* translators: Information about a recurring yearly payment made by a subscriber to a site owner.
				%(amount)s - the amount paid,
				%(formattedDate)s - the date it was first paid
				%(title)s - description of the payment plan, or a blank space if no description available
				%(total)s - the total amount subscriber has paid thus far */
			return translate(
				'Paying %(amount)s/year%(title)ssince %(formattedDate)s. Total of %(total)s.',
				{
					args: {
						amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
						formattedDate: moment( subscriber.start_date ).format( 'll' ),
						total: formatCurrency( subscriber.all_time_total, subscriber.plan.currency ),
						title,
					},
				}
			);
		} else if ( subscriber.plan.renew_interval === PLAN_MONTHLY_FREQUENCY ) {
			/* translators: Information about a recurring monthly payment made by a subscriber to a site owner.
				%(amount)s - the amount paid,
				%(formattedDate)s - the date it was first paid
				%(title)s - description of the payment plan, or a blank space if no description available
				%(total)s - the total amount subscriber has paid thus far */
			return translate(
				'Paying %(amount)s/month%(title)ssince %(formattedDate)s. Total of %(total)s.',
				{
					args: {
						amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
						formattedDate: moment( subscriber.start_date ).format( 'll' ),
						total: formatCurrency( subscriber.all_time_total, subscriber.plan.currency ),
						title,
					},
				}
			);
		}
	}

	function renderSubscriberActions( subscriber ) {
		return (
			<EllipsisMenu position="bottom left" className="memberships__subscriber-actions">
				<PopoverMenuItem
					target="_blank"
					rel="noopener norefferer"
					href={ `https://dashboard.stripe.com/search?query=metadata%3A${ subscriber.user.ID }` }
				>
					<Gridicon size={ 18 } icon="external" />
					{ translate( 'See transactions in Stripe Dashboard' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => setCancelledSubscriber( subscriber ) }>
					<Gridicon size={ 18 } icon="cross" />
					{ getIntervalDependantWording( subscriber ).button }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	function renderSubscriber( subscriber ) {
		return (
			<Card className="memberships__subscriber-profile is-compact" key={ subscriber.id }>
				{ renderSubscriberActions( subscriber ) }
				<div className="memberships__subscriber-gravatar">
					<Gravatar user={ subscriber.user } size={ 72 } />
				</div>
				<div className="memberships__subscriber-detail">
					<div className="memberships__subscriber-username">
						{ decodeEntities( subscriber.user.name ) }
					</div>
					<div className="memberships__subscriber-email" data-e2e-login={ subscriber.user_email }>
						<span>{ subscriber.user.user_email }</span>
					</div>
					<div className="memberships__subscriber-subscribed">
						{ renderSubscriberSubscriptionSummary( subscriber ) }
					</div>
				</div>
			</Card>
		);
	}

	function renderStripeConnected() {
		return (
			<div>
				{ renderNotices() }
				{ renderEarnings() }
				{ renderSubscriberList() }
				{ renderManagePlans() }
				{ renderSettings() }
			</div>
		);
	}

	function renderNotices() {
		const stripe_connect_success = query?.stripe_connect_success;

		if ( stripe_connect_success === 'earn' ) {
			const siteHasPlans = products.length !== 0;

			let congratsText = '';
			if ( ! siteHasPlans ) {
				congratsText = translate(
					'Congrats! Your site is now connected to Stripe. You can now add your first payment plan.'
				);
			} else {
				congratsText = translate( 'Congrats! Your site is now connected to Stripe.' );
			}

			return (
				<Notice status="is-success" showDismiss={ false } text={ congratsText }>
					{ ! siteHasPlans && (
						<NoticeAction href={ `/earn/payments-plans/${ site?.slug }` } icon="create">
							{ translate( 'Add a payment plan' ) }
						</NoticeAction>
					) }
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
						href={ `/earn/payments-plans/${ site?.slug }${ ADD_NEWSLETTER_PAYMENT_PLAN_HASH }` }
					>
						{ translate( 'Add payments' ) }
					</NoticeAction>
				</Notice>
			);
		}

		return null;
	}

	function renderOnboarding( cta, intro ) {
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
						<h3>
							{ englishLocales.includes( getLocaleSlug() ) ||
							i18n.hasTranslation( 'Simple fees structure' )
								? translate( 'Simple fees structure' )
								: translate( 'No membership fees' ) }
						</h3>
						<p>
							<CommissionFees commission={ commission } siteSlug={ site?.slug } />
						</p>
						<p>
							{ preventWidows(
								englishLocales.includes( getLocaleSlug() ) ||
									i18n.hasTranslation( 'No fixed monthly or annual fees charged.' )
									? translate( 'No fixed monthly or annual fees charged.' )
									: translate( 'No monthly or annual fees charged.' )
							) }
						</p>
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
		fetchNextSubscriberPage( true );
	}, [ fetchNextSubscriberPage, navigateToLaunchpad ] );

	if ( ! userCan( 'manage_options', site ) ) {
		return renderOnboarding(
			<Notice
				status="is-warning"
				text={ translate( 'Only site administrators can edit Payments settings.' ) }
				showDismiss={ false }
			/>
		);
	}

	return (
		<div>
			<QueryMembershipsEarnings siteId={ site?.ID } />
			<QueryMembershipsSettings siteId={ site?.ID } source={ source } />
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
	if ( window.location.hash === ADD_NEWSLETTER_PAYMENT_PLAN_HASH ) {
		return 'earn-newsletter';
	}
	if ( window.location.hash === LAUNCHPAD_HASH ) {
		return 'full-launchpad';
	}
	return 'calypso';
}

export default MembershipsSection;
