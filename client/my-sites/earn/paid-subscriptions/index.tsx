import { Card, Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { orderBy } from 'lodash';
import { useState, useEffect, useCallback } from 'react';
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
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import PaidSubscriptionPage from 'calypso/my-sites/earn/paid-subscriptions/paid-subscription/index';
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
import { Query, PaidSubscription } from '../types';
import CancelDialog from './cancel-dialog';

type PaidSubscriptionsSectionProps = {
	query?: Query;
};

const PaidSubscriptionsSection = ( { query }: PaidSubscriptionsSectionProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const subscriptionId = query?.paid_susbcription;
	const [ subscriberToCancel, setSubscriberToCancel ] = useState< PaidSubscription | null >( null );
	const site = useSelector( getSelectedSite );

	const paid_subscriptions = useSelector(
		( state ) => getOwnershipsForSiteId( state, site?.ID ),
		shallowEqual
	);

	const totalSubscribers = useSelector( ( state ) =>
		getTotalSubscribersForSiteId( state, site?.ID )
	);

	const fetchNextSubscriberPage = useCallback(
		( force: boolean ) => {
			const fetched = Object.keys( paid_subscriptions ).length;
			if ( fetched < totalSubscribers || force ) {
				dispatch( requestSubscribers( site?.ID, fetched ) );
			}
		},
		[ dispatch, site, paid_subscriptions, totalSubscribers ]
	);

	const downloadCsvLink = addQueryArgs(
		{
			page: 'subscribers',
			blog: site?.ID,
			blog_subscribers: 'csv',
			type: 'paid-supporter',
		},
		'https://dashboard.wordpress.com/wp-admin/index.php'
	);

	function renderSubscriberList() {
		return (
			<div>
				{ Object.values( paid_subscriptions ).length === 0 && (
					<Card>
						{ translate(
							"You don't have any active subscriptions yet. {{learnMoreLink}}Learn more{{/learnMoreLink}} about payments.",
							{
								components: {
									learnMoreLink: isJetpackCloud() ? (
										<a
											href={ localizeUrl(
												'https://jetpack.com/support/jetpack-blocks/payments-block/'
											) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									) : (
										<InlineSupportLink supportContext="payments_blocks" showIcon={ false } />
									),
								},
							}
						) }
					</Card>
				) }
				{ Object.values( paid_subscriptions ).length > 0 && (
					<>
						<ul className="paid-subscriptions-list" role="table">
							<li className="row header" role="row">
								<span className="paid-subscriptions-list__profile-column" role="columnheader">
									{ translate( 'Name' ) }
								</span>
								<span className="paid-subscriptions-list__offer-type-column" role="columnheader">
									{ translate( 'Offer Type' ) }
								</span>
								<span className="paid-subscriptions-list__total-column" role="columnheader">
									{ translate( 'Total' ) }
								</span>
								<span className="paid-subscriptions-list__since-column" role="columnheader">
									{ translate( 'Since' ) }
								</span>
								<span className="paid-subscriptions-list__menu-column" role="columnheader">
									<Tooltip text={ translate( 'Download list as CSV' ) } delay={ 0 }>
										<Button href={ downloadCsvLink }>{ translate( 'Export' ) }</Button>
									</Tooltip>
								</span>
							</li>
							{ orderBy( Object.values( paid_subscriptions ), [ 'id' ], [ 'desc' ] ).map( ( sub ) =>
								renderSubscriber( sub )
							) }
							<InfiniteScroll nextPageMethod={ () => fetchNextSubscriberPage( false ) } />
						</ul>
						<CancelDialog
							subscriberToCancel={ subscriberToCancel }
							setSubscriberToCancel={ setSubscriberToCancel }
						/>
						<div className="memberships__module-footer">
							<Button href={ downloadCsvLink }>{ translate( 'Export as CSV' ) }</Button>
						</div>
					</>
				) }
			</div>
		);
	}

	function getCancelButtonText( paidSubscription: PaidSubscription | null ) {
		return paidSubscription?.plan?.renew_interval === 'one-time'
			? translate( 'Remove payment' )
			: translate( 'Cancel payment' );
	}

	function renderPaidSubscriptionSummary( paidSubscription: PaidSubscription ) {
		if ( paidSubscription.plan.renew_interval === PLAN_ONE_TIME_FREQUENCY ) {
			return translate( 'One Time (%(amount)s)', {
				args: {
					amount: formatCurrency(
						paidSubscription.plan.renewal_price,
						paidSubscription.plan.currency
					),
				},
			} );
		} else if ( paidSubscription.plan.renew_interval === PLAN_YEARLY_FREQUENCY ) {
			return translate( 'Yearly (%(amount)s)', {
				args: {
					amount: formatCurrency(
						paidSubscription.plan.renewal_price,
						paidSubscription.plan.currency
					),
				},
			} );
		} else if ( paidSubscription.plan.renew_interval === PLAN_MONTHLY_FREQUENCY ) {
			return translate( 'Monthly (%(amount)s)', {
				args: {
					amount: formatCurrency(
						paidSubscription.plan.renewal_price,
						paidSubscription.plan.currency
					),
				},
			} );
		}
	}
	const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

	function renderSubscriberActions( paidSubscription: PaidSubscription ) {
		return (
			<EllipsisMenu position="bottom left" className="memberships__subscriber-actions">
				<PopoverMenuItem
					href={ `${ earnPath }/paid-subscriptions/${ site?.slug }?paid_susbcription=${ paidSubscription.id }` }
				>
					<Gridicon size={ 18 } icon="visible" />
					{ translate( 'View' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => setSubscriberToCancel( paidSubscription ) }>
					<Gridicon size={ 18 } icon="cross" />
					{ getCancelButtonText( paidSubscription ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	function renderSubscriber( paidSubscription: PaidSubscription ) {
		return (
			<li key={ paidSubscription.id } className="paid-subscription-row row" role="row">
				<span className="paid-subscriptions-list__profile-column" role="cell">
					<div className="paid-subscriptions-list__user-profile">
						<Gravatar
							user={ paidSubscription.user }
							size={ 40 }
							className="paid-subscriptions-list__user-image"
						/>
						<div className="paid-subscriptions-list__user-details">
							<span className="paid-subscriptions-list__user-name">
								{ decodeEntities( paidSubscription.user.name ) }
							</span>
							<span className="paid-subscriptions-list__user-email">
								{ paidSubscription.user.user_email }
							</span>
						</div>
					</div>
				</span>
				<span className="paid-subscriptions-list__offer-type-column" role="cell">
					<div className="paid-subscriptions-list__offer-type-title">
						{ paidSubscription.plan.title ? `${ paidSubscription.plan.title }` : ' ' }
					</div>
					<div className="paid-subscriptions-list__offer-type-price">
						{ renderPaidSubscriptionSummary( paidSubscription ) }
					</div>
				</span>
				<span className="paid-subscriptions-list__total-column" role="cell">
					{ formatCurrency( paidSubscription.all_time_total, paidSubscription.plan.currency ) }
				</span>
				<span className="paid-subscriptions-list__since-column" role="cell">
					{ moment( paidSubscription.start_date ).format( 'll' ) }
				</span>
				<span className="paid-subscriptions-list__menu-column" role="cell">
					{ renderSubscriberActions( paidSubscription ) }
				</span>
			</li>
		);
	}

	function getSinglePaidSubscription( subscriptionId: string ) {
		const subscriptionsList = Object.values( paid_subscriptions );
		return subscriptionsList.filter( ( subscription ) => subscription.id === subscriptionId )[ 0 ];
	}

	useEffect( () => {
		fetchNextSubscriberPage( true );
	}, [ fetchNextSubscriberPage ] );

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	if ( subscriptionId ) {
		const paidSubscription = getSinglePaidSubscription( subscriptionId );
		if ( paidSubscription ) {
			return <PaidSubscriptionPage paidSubscription={ paidSubscription } />;
		}
	}

	return (
		<div>
			<QueryMembershipsEarnings siteId={ site.ID } />
			<QueryMembershipsSettings siteId={ site.ID } />
			<div>{ renderSubscriberList() }</div>
		</div>
	);
};

export default PaidSubscriptionsSection;
