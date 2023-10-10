import { Card, Button, Dialog, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { saveAs } from 'browser-filesaver';
import { useTranslate } from 'i18n-calypso';
import { orderBy } from 'lodash';
import { useState, useEffect, useCallback, MouseEvent } from 'react';
import { shallowEqual } from 'react-redux';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import Gravatar from 'calypso/components/gravatar';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { decodeEntities } from 'calypso/lib/formatting';
import { useDispatch, useSelector } from 'calypso/state';
import {
	requestSubscribers,
	requestSubscriptionStop,
} from 'calypso/state/memberships/subscribers/actions';
import {
	getTotalSubscribersForSiteId,
	getOwnershipsForSiteId,
} from 'calypso/state/memberships/subscribers/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
} from '../memberships/constants';

type Subscriber = {
	id: string;
	status: string;
	start_date: string;
	end_date: string;
	// appears as both subscriber.user_email & subscriber.user.user_email in this file
	user_email: string;
	user: {
		ID: string;
		name: string;
		user_email: string;
	};
	plan: {
		connected_account_product_id: string;
		title: string;
		renewal_price: number;
		currency: string;
		renew_interval: string;
	};
	renew_interval: string;
	all_time_total: number;
};

function CustomerSection() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const [ cancelledSubscriber, setCancelledSubscriber ] = useState< Subscriber | null >( null );

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const subscribers = useSelector(
		( state ) => getOwnershipsForSiteId( state, site?.ID ),
		shallowEqual
	);

	const totalSubscribers = useSelector( ( state ) =>
		getTotalSubscribersForSiteId( state, site?.ID )
	);

	const fetchNextSubscriberPage = useCallback(
		( force: boolean ) => {
			const fetched = Object.keys( subscribers ).length;
			if ( fetched < totalSubscribers || force ) {
				dispatch( requestSubscribers( site?.ID, fetched ) );
			}
		},
		[ dispatch, site, subscribers, totalSubscribers ]
	);

	function onCloseCancelSubscription( reason: string | undefined ) {
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

	function downloadSubscriberList( event: MouseEvent< HTMLButtonElement > ) {
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

	function getIntervalDependantWording( subscriber: Subscriber | null ) {
		const subscriber_email = subscriber?.user.user_email ?? '';
		const plan_name = subscriber?.plan.title ?? '';

		if ( subscriber?.plan?.renew_interval === 'one-time' ) {
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

	function renderSubscriberSubscriptionSummary( subscriber: Subscriber ) {
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

	function renderSubscriberActions( subscriber: Subscriber ) {
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

	function renderSubscriber( subscriber: Subscriber ) {
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

	useEffect( () => {
		fetchNextSubscriberPage( true );
	}, [ fetchNextSubscriberPage ] );

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<div>
			<QueryMembershipsEarnings siteId={ site.ID } />
			<QueryMembershipsSettings siteId={ site.ID } />
			<div>{ renderSubscriberList() }</div>
		</div>
	);
}

export default CustomerSection;
