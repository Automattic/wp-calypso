import { Tooltip } from '@automattic/components';
import { useTranslate, numberFormat } from 'i18n-calypso';
import React, { useRef, useState } from 'react';

export interface EmailStatsItem {
	unique_opens: number;
	opens: number;
	opens_rate: number;
	unique_clicks: number;
	clicks: number;
	clicks_rate: number;
	total_sends: number;
}

interface TooltipWrapperProps {
	value: string;
	item: EmailStatsItem;
	TooltipContent: React.ComponentType< { item: EmailStatsItem } >;
}

export const TooltipWrapper: React.FC< TooltipWrapperProps > = ( {
	value,
	item,
	TooltipContent,
} ) => {
	const triggerRef = useRef< HTMLSpanElement >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	return (
		<span className="stats-email__tooltip-wrapper">
			<span
				ref={ triggerRef }
				className="stats-email__tooltip-trigger"
				onMouseEnter={ () => setShowTooltip( true ) }
				onMouseLeave={ () => setShowTooltip( false ) }
			>
				{ value }
			</span>
			<Tooltip position="top" context={ triggerRef.current } isVisible={ showTooltip }>
				<TooltipContent item={ item } />
			</Tooltip>
		</span>
	);
};

export const hasUniqueMetrics = ( uniqueValue: number, totalValue: number ) => {
	return uniqueValue > 0 && totalValue > 0;
};

export const OpensTooltipContent: React.FC< { item: EmailStatsItem } > = ( { item } ) => {
	const translate = useTranslate();
	const hasUniques = hasUniqueMetrics(
		parseInt( String( item.unique_opens ), 10 ),
		parseInt( String( item.opens ), 10 )
	);

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sendsCountFormatted)s', {
					args: { sendsCountFormatted: numberFormat( item.total_sends ) },
				} ) }
			</div>
			<div>
				{ translate( 'Total opens: %(opensCountFormatted)s', {
					args: { opensCountFormatted: numberFormat( item.opens ) },
				} ) }
			</div>
			<div>
				{ hasUniques
					? translate( 'Unique opens: %(uniqueOpensCountFormatted)s (%(opensRate)s%)', {
							args: {
								uniqueOpensCountFormatted: numberFormat( item.unique_opens ),
								opensRate: numberFormat( item.opens_rate, {
									numberFormatOptions: { maximumFractionDigits: 2 },
								} ),
							},
					  } )
					: translate( 'Unique opens: —' ) }
			</div>
		</div>
	);
};

export const ClicksTooltipContent: React.FC< { item: EmailStatsItem } > = ( { item } ) => {
	const translate = useTranslate();
	const hasUniques = hasUniqueMetrics(
		parseInt( String( item.unique_clicks ), 10 ),
		parseInt( String( item.clicks ), 10 )
	);

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sendsCountFormatted)s', {
					args: { sendsCountFormatted: numberFormat( item.total_sends ) },
				} ) }
			</div>
			<div>
				{ translate( 'Total clicks: %(clicksCountFormatted)s', {
					args: { clicksCountFormatted: numberFormat( item.clicks ) },
				} ) }
			</div>
			<div>
				{ hasUniques
					? translate( 'Unique clicks: %(uniqueClicksCountFormatted)s (%(clicksRate)s%)', {
							args: {
								uniqueClicksCountFormatted: numberFormat( item.unique_clicks ),
								clicksRate: numberFormat( item.clicks_rate, {
									numberFormatOptions: { maximumFractionDigits: 2 },
								} ),
							},
					  } )
					: translate( 'Unique clicks: —' ) }
			</div>
		</div>
	);
};
