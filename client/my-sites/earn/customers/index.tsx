import { Card, Button, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
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
import InlineSupportLink from 'calypso/components/inline-support-link';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { decodeEntities } from 'calypso/lib/formatting';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSubscribers } from 'calypso/state/memberships/subscribers/actions';
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
import { Subscriber } from '../types';
import CancelDialog from './cancel-dialog';
import Customer from './customer/index';

function CustomerSection() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const subscriberId = new URLSearchParams( window.location.search ).get( 'subscriber' );
	const [ subscriberToCancel, setSubscriberToCancel ] = useState< Subscriber | null >( null );
	const site = useSelector( getSelectedSite );

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
		return (
			<div>
				{ Object.values( subscribers ).length === 0 && (
					<Card>
						{ translate(
							"You haven't added any customers. {{learnMoreLink}}Learn more{{/learnMoreLink}} about payments.",
							{
								components: {
									learnMoreLink: (
										<InlineSupportLink supportContext="payments_blocks" showIcon={ false } />
									),
								},
							}
						) }
					</Card>
				) }
				{ Object.values( subscribers ).length > 0 && (
					<>
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
						<CancelDialog
							subscriberToCancel={ subscriberToCancel }
							setSubscriberToCancel={ setSubscriberToCancel }
						/>
						<div className="memberships__module-footer">
							<Button onClick={ downloadSubscriberList }>
								{ translate( 'Download list as CSV' ) }
							</Button>
						</div>
					</>
				) }
			</div>
		);
	}

	function getCancelButtonText( subscriber: Subscriber | null ) {
		return subscriber?.plan?.renew_interval === 'one-time'
			? translate( 'Remove payment' )
			: translate( 'Cancel payment' );
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
				<PopoverMenuItem href={ `/earn/supporters/${ site?.slug }?subscriber=${ subscriber.id }` }>
					<Gridicon size={ 18 } icon="visible" />
					{ translate( 'View' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => setSubscriberToCancel( subscriber ) }>
					<Gridicon size={ 18 } icon="cross" />
					{ getCancelButtonText( subscriber ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	function renderSubscriber( subscriber: Subscriber ) {
		return (
			<li key={ subscriber.id } className="supporter-row row" role="row">
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

	function getSingleSubscriber( subscriberId: string ) {
		const subscriberList = Object.values( subscribers );
		return subscriberList.filter( ( subscriber ) => subscriber.id === subscriberId )[ 0 ];
	}

	useEffect( () => {
		fetchNextSubscriberPage( true );
	}, [ fetchNextSubscriberPage ] );

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	if ( subscriberId ) {
		const subscriber = getSingleSubscriber( subscriberId );
		if ( subscriber ) {
			return <Customer customer={ subscriber } />;
		}
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
