/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { orderBy } from 'lodash';
import formatCurrency from '@automattic/format-currency';
import { saveAs } from 'browser-filesaver';

/**
 * Internal dependencies
 */
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { Card, Button, Dialog } from '@automattic/components';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { requestDisconnectStripeAccount } from 'calypso/state/memberships/settings/actions';
import {
	requestSubscribers,
	requestSubscriptionStop,
} from 'calypso/state/memberships/subscribers/actions';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import Gravatar from 'calypso/components/gravatar';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import {
	FEATURE_MEMBERSHIPS,
	PLAN_PERSONAL,
	PLAN_JETPACK_PERSONAL,
} from 'calypso/lib/plans/constants';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SectionHeader from 'calypso/components/section-header';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import Gridicon from 'calypso/components/gridicon';
import { userCan } from 'calypso/lib/site/utils';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import ExternalLink from 'calypso/components/external-link';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { getEarningsWithDefaultsForSiteId } from 'calypso/state/memberships/earnings/selectors';
import {
	getTotalSubscribersForSiteId,
	getOwnershipsForSiteId,
} from 'calypso/state/memberships/subscribers/selectors';
import {
	getConnectedAccountIdForSiteId,
	getConnectUrlForSiteId,
} from 'calypso/state/memberships/settings/selectors';

/**
 * Image dependencies
 */
import paymentsImage from 'calypso/assets/images/earn/payments-illustration.svg';

/**
 * Style dependencies
 */
import './style.scss';

class MembershipsSection extends Component {
	constructor( props ) {
		super( props );
		this.downloadSubscriberList = this.downloadSubscriberList.bind( this );
	}
	state = {
		cancelledSubscriber: null,
		disconnectedConnectedAccountId: null,
	};
	componentDidMount() {
		this.fetchNextSubscriberPage( false, true );
	}
	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			// Site Id changed
			this.fetchNextSubscriberPage( false, true );
		}
	}
	renderEarnings() {
		const { commission, currency, forecast, lastMonth, siteId, total, translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Earnings' ) } />
				<QueryMembershipsEarnings siteId={ siteId } />
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
					<div className="memberships__earnings-breakdown-notes">
						{ commission !== null &&
							translate(
								'On your current plan, WordPress.com charges {{em}}%(commission)s{{/em}}.{{br/}} Additionally, Stripe charges are typically %(stripe)s. {{a}}Learn more{{/a}}',
								{
									args: {
										commission: '' + parseFloat( commission ) * 100 + '%',
										stripe: '2.9%+30c',
									},
									components: {
										em: <em />,
										br: <br />,
										a: (
											<ExternalLink
												href="https://wordpress.com/support/recurring-payments-button/#related-fees"
												icon
											/>
										),
									},
								}
							) }
					</div>
				</Card>
			</div>
		);
	}

	fetchNextSubscriberPage( triggeredByInteraction, force ) {
		const fetched = Object.keys( this.props.subscribers ).length;
		if ( fetched < this.props.totalSubscribers || force ) {
			this.props.requestSubscribers( this.props.siteId, fetched );
		}
	}

	onCloseDisconnectStripeAccount = ( reason ) => {
		if ( reason === 'disconnect' ) {
			this.props.requestDisconnectStripeAccount(
				this.props.siteId,
				this.props.connectedAccountId,
				this.props.translate( 'Please wait, disconnecting Stripe\u2026' ),
				this.props.translate( 'Stripe account is disconnected.' )
			);
		}
		this.setState( { disconnectedConnectedAccountId: null } );
	};

	onCloseCancelSubscription = ( reason ) => {
		if ( reason === 'cancel' ) {
			this.props.requestSubscriptionStop(
				this.props.siteId,
				this.state.cancelledSubscriber,
				this.props.translate( 'Subscription cancelled for %(email)s', {
					args: {
						email: this.state.cancelledSubscriber.user.user_email,
					},
				} )
			);
		}
		this.setState( { cancelledSubscriber: null } );
	};

	downloadSubscriberList( event ) {
		event.preventDefault();
		const fileName = [ this.props.siteSlug, 'memberships', 'subscribers' ].join( '_' ) + '.csv';

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
				Object.values( this.props.subscribers ).map( ( row ) =>
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

	renderSubscriberList() {
		return (
			<div>
				<SectionHeader label={ this.props.translate( 'Customers and Subscribers' ) } />
				{ Object.values( this.props.subscribers ).length === 0 && (
					<Card>
						{ this.props.translate(
							"You haven't added any customers. {{a}}Learn more{{/a}} about payments.",
							{
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
							}
						) }
					</Card>
				) }
				{ Object.values( this.props.subscribers ).length > 0 && (
					<Card>
						<div className="memberships__module-content module-content">
							<div>
								{ orderBy(
									Object.values( this.props.subscribers ),
									[ 'id' ],
									[ 'desc' ]
								).map( ( sub ) => this.renderSubscriber( sub ) ) }
							</div>
							<InfiniteScroll
								nextPageMethod={ ( triggeredByInteraction ) =>
									this.fetchNextSubscriberPage( triggeredByInteraction, false )
								}
							/>
						</div>
						<Dialog
							isVisible={ !! this.state.cancelledSubscriber }
							buttons={ [
								{
									label: this.props.translate( 'Back' ),
									action: 'back',
								},
								{
									label: this.props.translate( 'Cancel Subscription' ),
									isPrimary: true,
									action: 'cancel',
								},
							] }
							onClose={ this.onCloseCancelSubscription }
						>
							<h1>{ this.props.translate( 'Confirmation' ) }</h1>
							<p>{ this.props.translate( 'Do you want to cancel this subscription?' ) }</p>
							<Notice
								text={ this.props.translate(
									'Canceling the subscription will mean the subscriber %(email)s will no longer be charged.',
									{
										args: {
											email: this.state.cancelledSubscriber
												? this.state.cancelledSubscriber.user.user_email
												: '',
										},
									}
								) }
								showDismiss={ false }
							/>
						</Dialog>
						<div className="memberships__module-footer">
							<Button onClick={ this.downloadSubscriberList }>
								{ this.props.translate( 'Download list as CSV' ) }
							</Button>
						</div>
					</Card>
				) }
			</div>
		);
	}

	renderManagePlans() {
		return (
			<div>
				<SectionHeader label={ this.props.translate( 'Manage plans' ) } />
				<Card href={ '/earn/payments-plans/' + this.props.siteSlug }>
					<QueryMembershipProducts siteId={ this.props.siteId } />
					<div className="memberships__module-plans-content">
						<div className="memberships__module-plans-icon">
							<Gridicon size={ 24 } icon={ 'credit-card' } />
						</div>
						<div>
							<div className="memberships__module-plans-title">
								{ this.props.translate( 'Payment plans' ) }
							</div>
							<div className="memberships__module-plans-description">
								{ this.props.translate(
									'Single and recurring payments for goods, services, and subscriptions'
								) }
							</div>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	renderSettings() {
		return (
			<div>
				<SectionHeader label={ this.props.translate( 'Settings' ) } />
				<Card
					onClick={ () =>
						this.setState( { disconnectedConnectedAccountId: this.props.connectedAccountId } )
					}
					className="memberships__settings-link"
				>
					<div className="memberships__module-plans-content">
						<div className="memberships__module-plans-icon">
							<Gridicon size={ 24 } icon={ 'link-break' } />
						</div>
						<div className="memberships__module-settings-title">
							{ this.props.translate( 'Disconnect Stripe Account' ) }
						</div>
					</div>
				</Card>
				<Dialog
					isVisible={ !! this.state.disconnectedConnectedAccountId }
					buttons={ [
						{
							label: this.props.translate( 'Cancel' ),
							action: 'cancel',
						},
						{
							label: this.props.translate( 'Disconnect Payments from Stripe' ),
							isPrimary: true,
							action: 'disconnect',
						},
					] }
					onClose={ this.onCloseDisconnectStripeAccount }
				>
					<h1>{ this.props.translate( 'Confirmation' ) }</h1>
					<p>
						{ this.props.translate(
							'Do you want to disconnect Payments from your Stripe account?'
						) }
					</p>
					<Notice
						text={ this.props.translate(
							'Once you disconnect Payments from Stripe, new subscribers won’t be able to sign up and existing subscriptions will stop working.{{br/}}{{strong}}Disconnecting your Stripe account here will remove it from all your WordPress.com and Jetpack sites.{{/strong}}',
							{
								components: {
									br: <br />,
									strong: <strong />,
								},
							}
						) }
						showDismiss={ false }
					/>
				</Dialog>
			</div>
		);
	}

	renderSubscriberSubscriptionSummary( subscriber ) {
		const title = subscriber.plan.title ? ` (${ subscriber.plan.title }) ` : ' ';
		if ( subscriber.plan.renew_interval === 'one-time' ) {
			/* translators: Information about a one-time payment made by a subscriber to a site owner.
				%(amount)s - the amount paid,
				%(formattedDate) - the date it was paid
				%(title) - description of the payment plan, or a blank space if no description available. */
			return this.props.translate( 'Paid %(amount)s once on %(formattedDate)s%(title)s', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
					formattedDate: this.props.moment( subscriber.start_date ).format( 'll' ),
					title,
				},
			} );
		} else if ( subscriber.plan.renew_interval === '1 year' ) {
			/* translators: Information about a recurring yearly payment made by a subscriber to a site owner.
				%(amount)s - the amount paid,
				%(formattedDate)s - the date it was first paid
				%(title)s - description of the payment plan, or a blank space if no description available
				%(total)s - the total amount subscriber has paid thus far */
			return this.props.translate(
				'Paying %(amount)s/year%(title)ssince %(formattedDate)s. Total of %(total)s.',
				{
					args: {
						amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
						formattedDate: this.props.moment( subscriber.start_date ).format( 'll' ),
						total: formatCurrency( subscriber.all_time_total, subscriber.plan.currency ),
						title,
					},
				}
			);
		} else if ( subscriber.plan.renew_interval === '1 month' ) {
			/* translators: Information about a recurring monthly payment made by a subscriber to a site owner.
				%(amount)s - the amount paid,
				%(formattedDate)s - the date it was first paid
				%(title)s - description of the payment plan, or a blank space if no description available
				%(total)s - the total amount subscriber has paid thus far */
			return this.props.translate(
				'Paying %(amount)s/month%(title)ssince %(formattedDate)s. Total of %(total)s.',
				{
					args: {
						amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
						formattedDate: this.props.moment( subscriber.start_date ).format( 'll' ),
						total: formatCurrency( subscriber.all_time_total, subscriber.plan.currency ),
						title,
					},
				}
			);
		}
	}
	renderSubscriberActions( subscriber ) {
		return (
			<EllipsisMenu position="bottom left" className="memberships__subscriber-actions">
				<PopoverMenuItem
					target="_blank"
					rel="noopener norefferer"
					href={ `https://dashboard.stripe.com/test/search?query=metadata%3A${ subscriber.user.ID }` }
				>
					<Gridicon size={ 18 } icon={ 'external' } />
					{ this.props.translate( 'See transactions in Stripe Dashboard' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => this.setState( { cancelledSubscriber: subscriber } ) }>
					<Gridicon size={ 18 } icon={ 'cross' } />
					{ this.props.translate( 'Cancel Subscription' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}
	renderSubscriber( subscriber ) {
		return (
			<Card className="memberships__subscriber-profile is-compact" key={ subscriber.id }>
				{ this.renderSubscriberActions( subscriber ) }
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
						{ this.renderSubscriberSubscriptionSummary( subscriber ) }
					</div>
				</div>
			</Card>
		);
	}

	renderStripeConnected() {
		return (
			<div>
				{ this.props.query.stripe_connect_success === 'earn' && (
					<Notice
						status="is-success"
						showDismiss={ false }
						text={ this.props.translate(
							'Congrats! Your site is now connected to Stripe. You can now add your first payment plan.'
						) }
					>
						<NoticeAction href={ `/earn/payments-plans/${ this.props.siteSlug }` } icon="create">
							{ this.props.translate( 'Add a payment plan' ) }
						</NoticeAction>
					</Notice>
				) }
				{ this.renderEarnings() }
				{ this.renderSubscriberList() }
				{ this.renderManagePlans() }
				{ this.renderSettings() }
			</div>
		);
	}

	renderOnboarding( cta ) {
		const { translate } = this.props;

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
									'WordPress.com Payments makes it easy to sell physical and digital goods, accept donations, charge for in-person services, build subscription newsletters, and more.'
								)
							) }
						</p>
						<p className="memberships__onboarding-paragraph">
							{ preventWidows(
								translate(
									'One-time, monthly, and yearly credit and debit card payment options are supported. {{link}}Learn more about payments.{{/link}}',
									{
										components: {
											link: (
												<a href="https://wordpress.com/support/wordpress-editor/blocks/payments/#setting-up-payments" />
											),
										},
									}
								)
							) }
						</p>
						<p className="memberships__onboarding-paragraph">{ cta }</p>
						<p className="memberships__onboarding-paragraph memberships__onboarding-paragraph-disclaimer">
							{ preventWidows(
								translate(
									'Payments are securely processed by Stripe, a payment partner for all credit and debit card payments.'
								)
							) }
						</p>
					</div>
					<div className="memberships__onboarding-column-image">
						<img src={ paymentsImage } aria-hidden="true" alt="" />
					</div>
				</div>
				<div className="memberships__onboarding-benefits">
					<div>
						<h3>{ translate( 'Payments for anything' ) }</h3>
						{ preventWidows(
							translate(
								'Send paid newsletters and offer premium content, services, physical and digital goods, accept donations, and more.'
							)
						) }
					</div>
					<div>
						<h3>{ translate( 'Flexibile options' ) }</h3>
						{ preventWidows(
							translate(
								'Add as many one-time, monthly, yearly, and lifetime subscription options as you need.'
							)
						) }
					</div>
					<div>
						<h3>{ translate( "You're in control" ) }</h3>
						{ preventWidows(
							translate(
								'You choose which content requires payment. Easily manage subscribers and payment plans.'
							)
						) }
					</div>
					<div>
						<h3>{ translate( 'Global payments' ) }</h3>
						{ preventWidows(
							translate( 'Collect payments in 135 countries to reach customers around the world.' )
						) }
					</div>
				</div>
			</Card>
		);
	}

	renderConnectStripe() {
		return (
			<div>
				{ this.props.query.stripe_connect_cancelled && (
					<Notice
						showDismiss={ false }
						text={ this.props.translate(
							'The attempt to connect to Stripe has been cancelled. You can connect again at any time.'
						) }
					/>
				) }
				{ this.renderOnboarding(
					<Button primary href={ this.props.connectUrl }>
						{ this.props.translate( 'Connect Stripe to Get Started' ) }{ ' ' }
						<Gridicon size={ 18 } icon={ 'external' } />
					</Button>
				) }
			</div>
		);
	}

	render() {
		if ( ! this.props.paidPlan ) {
			return this.renderOnboarding(
				<UpsellNudge
					plan={ this.props.isJetpack ? PLAN_JETPACK_PERSONAL : PLAN_PERSONAL }
					shouldDisplay={ () => true }
					feature={ FEATURE_MEMBERSHIPS }
					title={ this.props.translate( 'Upgrade to the Personal plan' ) }
					description={ this.props.translate( 'Upgrade to start selling.' ) }
					showIcon
					event="calypso_memberships_upsell_nudge"
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
				/>
			);
		}

		if ( ! userCan( 'manage_options', this.props.site ) ) {
			return this.renderOnboarding(
				<Notice
					status="is-warning"
					text={ this.props.translate( 'Only site administrators can edit Payments settings.' ) }
					showDismiss={ false }
				/>
			);
		}

		return (
			<div>
				<QueryMembershipsSettings siteId={ this.props.siteId } />
				{ this.props.connectedAccountId && this.renderStripeConnected() }
				{ this.props.connectUrl && ! this.props.connectedAccountId && this.renderConnectStripe() }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const earnings = getEarningsWithDefaultsForSiteId( state, siteId );

	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		total: earnings.total,
		lastMonth: earnings.last_month,
		forecast: earnings.forecast,
		currency: earnings.currency,
		commission: earnings.commission,
		totalSubscribers: getTotalSubscribersForSiteId( state, siteId ),
		subscribers: getOwnershipsForSiteId( state, siteId ),
		connectedAccountId: getConnectedAccountIdForSiteId( state, siteId ),
		connectUrl: getConnectUrlForSiteId( state, siteId ),
		paidPlan: isSiteOnPaidPlan( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
	};
};

export default connect( mapStateToProps, {
	requestSubscribers,
	requestDisconnectStripeAccount,
	requestSubscriptionStop,
} )( localize( withLocalizedMoment( MembershipsSection ) ) );
