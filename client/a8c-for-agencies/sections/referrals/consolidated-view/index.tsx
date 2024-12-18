import { Card, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { getConsolidatedData } from '../lib/commissions';
import { getNextPayoutDate } from '../lib/get-next-payout-date';
import InfoModal from './info-modal';
import type { Referral, ReferralInvoice } from '../types';

import './style.scss';

type FooterInfoProps = {
	title?: string;
	children?: React.ReactNode;
	wrapperRef: React.RefObject< HTMLElement >;
	footerText: string;
};
const CardInfo = ( { children, wrapperRef, footerText, title }: FooterInfoProps ) => {
	const [ showPopover, setShowPopover ] = useState( false );
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	return (
		<>
			<div
				className={ clsx( 'consolidated-view__label-wapper', {
					mobile: isMobile,
				} ) }
			>
				<div className="consolidated-view__label">
					{ footerText }
					{ ! isMobile && (
						<span
							className="consolidated-view__info-icon"
							onClick={ () => setShowPopover( true ) }
							role="button"
							tabIndex={ 0 }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' ) {
									setShowPopover( true );
								}
							} }
						>
							<Gridicon icon="info-outline" size={ 16 } />
						</span>
					) }
				</div>
				{ isMobile && (
					<Button
						className="consolidated-view__info-mobile"
						onClick={ () => setShowPopover( true ) }
					>
						<Gridicon icon="info-outline" size={ 12 } />
						<span>{ translate( 'More info' ) }</span>
					</Button>
				) }
			</div>
			{ showPopover &&
				( isMobile ? (
					<InfoModal title={ title ?? '' } onClose={ () => setShowPopover( false ) }>
						{ children }
					</InfoModal>
				) : (
					<A4APopover
						title=""
						offset={ 12 }
						wrapperRef={ wrapperRef }
						onFocusOutside={ () => setShowPopover( false ) }
					>
						{ children }
					</A4APopover>
				) ) }
		</>
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

	const { data, isFetching } = useProductsQuery( false, false, true );

	const [ consolidatedData, setConsolidatedData ] = useState( {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	} );

	const commissionInfoRef = useRef< HTMLDivElement | null >( null );
	const pendingOrdersRef = useRef< HTMLDivElement | null >( null );
	const nextPayoutDateRef = useRef< HTMLDivElement | null >( null );
	const pendingCommissionRef = useRef< HTMLDivElement | null >( null );

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
			<Card compact ref={ commissionInfoRef }>
				<div className="consolidated-view__value">
					{ showLoader ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.allTimeCommissions, 'USD' )
					) }
				</div>
				<CardInfo
					title={ translate( 'Total payouts' ) }
					wrapperRef={ commissionInfoRef }
					footerText={ translate( 'All time referral payouts' ) }
				>
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
				</CardInfo>
			</Card>
			<Card compact ref={ pendingCommissionRef }>
				<div className="consolidated-view__value">
					{ showLoader ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.pendingCommission, 'USD' )
					) }
				</div>
				<CardInfo
					title={ translate( 'Estimated amount' ) }
					wrapperRef={ pendingCommissionRef }
					footerText={ translate( 'Commissions expected' ) }
				>
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
				</CardInfo>
			</Card>
			<Card compact ref={ nextPayoutDateRef }>
				<div className="consolidated-view__value">{ nextPayoutDate + '*' }</div>
				<CardInfo
					title={ translate( 'Estimated date' ) }
					wrapperRef={ nextPayoutDateRef }
					footerText={ translate( 'Next estimated payout date' ) }
				>
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
				</CardInfo>
			</Card>
			<Card compact ref={ pendingOrdersRef }>
				<div className="consolidated-view__value">{ consolidatedData.pendingOrders }</div>
				<CardInfo
					title={ translate( 'Pending orders' ) }
					wrapperRef={ pendingOrdersRef }
					footerText={ translate( 'Pending referral orders' ) }
				>
					<div className="consolidated-view__popover-content">
						{ translate(
							'These are the number of pending referrals (unpaid carts).' +
								'{{br}}{{/br}}{{a}}Learn more{{/a}} ↗',
							{
								components: {
									a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
									br: <br />,
								},
								args: {
									estimatedCommission: 154,
								},
								comment:
									'This is a tooltip explaining how the commission payout date is calculated',
							}
						) }
					</div>
				</CardInfo>
			</Card>
		</div>
	);
}
