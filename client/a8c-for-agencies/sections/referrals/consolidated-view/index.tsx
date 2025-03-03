import { Card, Gridicon } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate, formatCurrency } from 'i18n-calypso';
import { useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import InfoModal from './info-modal';
import type { Referral } from '../types';

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

type ConsolidatedViewsProps = {
	referrals: Referral[];
	totalPayouts?: number;
};

export default function ConsolidatedViews( { referrals, totalPayouts }: ConsolidatedViewsProps ) {
	const translate = useTranslate();

	const { data: productsData, isFetching } = useProductsQuery( false, false, true );

	const commissionInfoRef = useRef< HTMLDivElement | null >( null );
	const pendingOrdersRef = useRef< HTMLDivElement | null >( null );
	const nextPayoutDateRef = useRef< HTMLDivElement | null >( null );
	const pendingCommissionRef = useRef< HTMLDivElement | null >( null );

	// Logic is moved to the hook for better readability
	const { expectedCommission, pendingOrders, nextPayoutActivityWindow, nextPayoutDate } =
		useGetConsolidatedPayoutData( referrals, productsData );

	const link =
		'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

	const showLoader = isFetching;

	return (
		<div className="consolidated-view">
			{ totalPayouts !== undefined && (
				<Card compact ref={ commissionInfoRef }>
					<div className="consolidated-view__value">{ formatCurrency( totalPayouts, 'USD' ) }</div>
					<CardInfo
						title={ translate( 'Total payouts' ) }
						wrapperRef={ commissionInfoRef }
						footerText={ translate( 'All time referral payouts' ) }
					>
						<div className="consolidated-view__popover-content">
							{ translate(
								'The exact amount your agency has been paid out for referrals.' +
									'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
								{
									components: {
										a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
										br: <br />,
									},
								}
							) }
						</div>
					</CardInfo>
				</Card>
			) }
			<Card compact ref={ pendingCommissionRef }>
				<div className="consolidated-view__value">
					{ showLoader ? <TextPlaceholder /> : formatCurrency( expectedCommission, 'USD' ) }
				</div>
				<CardInfo
					title={ translate( 'Estimated amount' ) }
					wrapperRef={ pendingCommissionRef }
					footerText={ translate( 'Next estimated payout amount' ) }
				>
					<div className="consolidated-view__popover-content">
						{ translate(
							'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately. ' +
								'We estimate the commission based on the active use for the current month. ' +
								'{{br/}}{{br}}{{/br}}The next payout range is for:' +
								'{{br/}}{{span}}%(nextPayoutActivityWindow)s{{/span}}' +
								'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
							{
								components: {
									a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
									br: <br />,
									span: <span className="consolidated-view__popover-content-activity-dates" />,
								},
								args: {
									nextPayoutActivityWindow,
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
								'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
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
				<div className="consolidated-view__value">{ pendingOrders }</div>
				<CardInfo
					title={ translate( 'Pending orders' ) }
					wrapperRef={ pendingOrdersRef }
					footerText={ translate( 'Pending referral orders' ) }
				>
					<div className="consolidated-view__popover-content">
						{ translate(
							'These are the number of pending referrals (unpaid carts). ' +
								'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
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
		</div>
	);
}
