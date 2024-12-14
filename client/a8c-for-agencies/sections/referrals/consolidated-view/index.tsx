import { Card, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { getConsolidatedData } from '../lib/commissions';
import { getNextPayoutDate } from '../lib/get-next-payout-date';
import type { Referral, ReferralInvoice } from '../types';

import './style.scss';

const InfoIconWithPopover = ( { children }: { children: React.ReactNode } ) => {
	const [ showPopover, setShowPopover ] = useState( false );
	const wrapperRef = useRef< HTMLSpanElement | null >( null );

	return (
		<span
			className="consolidated-view__info-icon"
			onClick={ () => setShowPopover( true ) }
			role="button"
			tabIndex={ 0 }
			ref={ wrapperRef }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' ) {
					setShowPopover( true );
				}
			} }
		>
			<Gridicon icon="info-outline" size={ 16 } />
			{ showPopover && (
				<A4APopover
					title=""
					offset={ 12 }
					wrapperRef={ wrapperRef }
					onFocusOutside={ () => setShowPopover( false ) }
				>
					{ children }
				</A4APopover>
			) }
		</span>
	);
};

export default function ConsolidatedViews( {
	referrals,
	referralInvoices,
	isFetchingInvoices,
}: {
	referrals: Referral[];
	referralInvoices: ReferralInvoice[];
	isFetchingInvoices?: boolean;
} ) {
	const translate = useTranslate();

	const date = new Date();
	const month = date.toLocaleString( 'default', { month: 'long' } );
	const { data, isFetching } = useProductsQuery( false, false, true );

	const [ consolidatedData, setConsolidatedData ] = useState( {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	} );

	useEffect( () => {
		if ( data?.length ) {
			const consolidatedData = getConsolidatedData( referrals, data || [], referralInvoices );
			setConsolidatedData( consolidatedData );
		}
	}, [ referrals, data, referralInvoices ] );

	const link =
		'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

	const showLoader = isFetching || isFetchingInvoices;

	const nextPayoutDate = getNextPayoutDate( new Date() ).toLocaleString( 'default', {
		month: 'short',
		day: 'numeric',
	} );

	return (
		<div className="consolidated-view">
			<Card compact>
				<div className="consolidated-view__value">
					{ showLoader ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.allTimeCommissions, 'USD' )
					) }
				</div>
				<div className="consolidated-view__label">
					{ translate( 'All time commissions' ) }
					<InfoIconWithPopover>
						<div className="consolidated-view__popover-content">
							{ translate(
								'Every 60 days, we pay out commissions. {{a}}Learn more about payouts and commissions{{/a}}.',
								{
									components: {
										a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
									},
								}
							) }
						</div>
					</InfoIconWithPopover>
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">
					{ showLoader ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.pendingCommission, 'USD' )
					) }
				</div>
				<div className="consolidated-view__label">
					{ translate( 'Commissions expected in %(month)s', {
						args: { month },
						comment: 'month is the name of the current month',
					} ) }
					<InfoIconWithPopover>
						<div className="consolidated-view__popover-content">
							{ translate(
								'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately.' +
									' We estimate the commission based on the active use for the current month. {{a}}Learn more about payouts and commissions{{/a}}.',
								{
									components: {
										a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
									},
									comment: 'This is a tooltip explaining how the commission is calculated',
								}
							) }
						</div>
					</InfoIconWithPopover>
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">{ nextPayoutDate + '*' }</div>
				<div className="consolidated-view__label">
					{ translate( 'Next estimated payout date' ) }
					<InfoIconWithPopover>
						<div className="consolidated-view__popover-content">
							{ translate(
								'*Commissions are paid quarterly, after a 60-day waiting period, excluding refunds and chargebacks. ' +
									'Payout dates mark the start of processing, which may take a few extra days. Payments scheduled on weekends are processed the next business day. ' +
									'{{br}}{{/br}}{{a}}Learn more{{/a}} ↗',
								{
									components: {
										a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
										br: <br />,
									},
									comment:
										'This is a tooltip explaining how the commission payout date is calculated',
								}
							) }
						</div>
					</InfoIconWithPopover>
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">{ consolidatedData.pendingOrders }</div>
				<div className="consolidated-view__label">{ translate( 'Pending orders' ) }</div>
			</Card>
		</div>
	);
}
