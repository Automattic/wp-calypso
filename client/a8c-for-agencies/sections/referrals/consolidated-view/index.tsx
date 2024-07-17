import { Card, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { getConsolidatedData } from '../lib/commissions';
import type { Referral } from '../types';

import './style.scss';

export default function ConsolidatedViews( { referrals }: { referrals: Referral[] } ) {
	const translate = useTranslate();

	const date = new Date();
	const month = date.toLocaleString( 'default', { month: 'long' } );
	const { data, isFetching } = useProductsQuery( false, false, true );

	const [ showPopover, setShowPopover ] = useState( false );
	const wrapperRef = useRef< HTMLSpanElement | null >( null );

	const [ consolidatedData, setConsolidatedData ] = useState( {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	} );

	useEffect( () => {
		if ( data?.length ) {
			const consolidatedData = getConsolidatedData( referrals, data || [] );
			setConsolidatedData( consolidatedData );
		}
	}, [ referrals, data ] );

	const link = 'https://automattic.com/for-agencies/program-incentives/';

	return (
		<div className="consolidated-view">
			<Card compact>
				<div className="consolidated-view__value">
					{ isFetching ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.allTimeCommissions, 'USD' )
					) }
				</div>
				<div className="consolidated-view__label consolidated-view__label--all-time">
					{ translate( 'All time commissions' ) }
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
								<div className="consolidated-view__popover-content">
									{ translate(
										'Every 60 days, we pay out commissions. Learn more about {{a}}partner{{nbsp/}}earnings.{{/a}}',
										{
											components: {
												nbsp: <>&nbsp;</>,
												a: <a href={ link } target="_blank" rel="noreferrer noopener" />,
											},
										}
									) }
								</div>
							</A4APopover>
						) }
					</span>
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">
					{ isFetching ? (
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
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">{ consolidatedData.pendingOrders }</div>
				<div className="consolidated-view__label">{ translate( 'Pending orders' ) }</div>
			</Card>
		</div>
	);
}
