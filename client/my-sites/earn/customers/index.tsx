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
						<ul className="supporters-list" role="table">
							<li className="row header" role="row">
								<span className="supporters-list__profile-column" role="columnheader">
									{ translate( 'Name' ) }
								</span>
								<span className="supporters-list__offer-type-column" role="columnheader">
									{ translate( 'Offer Type' ) }
								</span>
								<span className="supporters-list__total-column" role="columnheader">
									{ translate( 'Total' ) }
								</span>
								<span className="supporters-list__since-column" role="columnheader">
									{ translate( 'Since' ) }
								</span>
								<span className="supporters-list__menu-column" role="columnheader"></span>
							</li>
							{ orderBy( Object.values( subscribers ), [ 'id' ], [ 'desc' ] ).map( ( sub ) =>
								renderSubscriber( sub )
							) }
							<InfiniteScroll nextPageMethod={ () => fetchNextSubscriberPage( false ) } />
						</ul>
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
		if ( subscriber.plan.renew_interval === PLAN_ONE_TIME_FREQUENCY ) {
			return translate( 'One Time (%(amount)s)', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
				},
			} );
		} else if ( subscriber.plan.renew_interval === PLAN_YEARLY_FREQUENCY ) {
			return translate( 'Yearly (%(amount)s)', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
				},
			} );
		} else if ( subscriber.plan.renew_interval === PLAN_MONTHLY_FREQUENCY ) {
			return translate( 'Monthly (%(amount)s)', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
				},
			} );
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
			<li className="supporter-row row" role="row">
				<span className="supporters-list__profile-column" role="cell">
					<div className="supporters-list__user-profile">
						<Gravatar
							user={ subscriber.user }
							size={ 40 }
							className="supporters-list__user-image"
						/>
						<div className="supporters-list__user-details">
							<span className="supporters-list__user-name">
								{ decodeEntities( subscriber.user.name ) }
							</span>
							<span className="supporters-list__user-email">{ subscriber.user.user_email }</span>
						</div>
					</div>
				</span>
				<span className="supporters-list__offer-type-column" role="cell">
					<div className="supporters-list__offer-type-title">
						{ subscriber.plan.title ? `${ subscriber.plan.title }` : ' ' }
					</div>
					<div className="supporters-list__offer-type-price">
						{ renderSubscriberSubscriptionSummary( subscriber ) }
					</div>
				</span>
				<span className="supporters-list__total-column" role="cell">
					{ formatCurrency( subscriber.all_time_total, subscriber.plan.currency ) }
				</span>
				<span className="supporters-list__since-column" role="cell">
					{ moment( subscriber.start_date ).format( 'll' ) }
				</span>
				<span className="supporters-list__menu-column" role="cell">
					{ renderSubscriberActions( subscriber ) }
				</span>
			</li>
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
