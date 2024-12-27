import { Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
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
	const opensUnique = parseInt( String( item.unique_opens ), 10 );
	const opens = parseInt( String( item.opens ), 10 );
	const opensRate = parseFloat( String( item.opens_rate ) );
	const totalSends = parseInt( String( item.total_sends ), 10 );
	const hasUniques = hasUniqueMetrics( opensUnique, opens );

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sends)d', {
					args: { sends: totalSends },
				} ) }
			</div>
			<div>
				{ translate( 'Total opens: %(opens)d', {
					args: { opens },
				} ) }
			</div>
			<div>
				{ hasUniques
					? translate( 'Unique opens: %(uniqueOpens)d (%(openRate).2f%%)', {
							args: { uniqueOpens: opensUnique, openRate: opensRate },
					  } )
					: translate( 'Unique opens: —' ) }
			</div>
		</div>
	);
};

export const ClicksTooltipContent: React.FC< { item: EmailStatsItem } > = ( { item } ) => {
	const translate = useTranslate();
	const clicksUnique = parseInt( String( item.unique_clicks ), 10 );
	const clicks = parseInt( String( item.clicks ), 10 );
	const clicksRate = parseFloat( String( item.clicks_rate ) );
	const totalSends = parseInt( String( item.total_sends ), 10 );
	const hasUniques = hasUniqueMetrics( clicksUnique, clicks );

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sends)d', {
					args: { sends: totalSends },
				} ) }
			</div>
			<div>
				{ translate( 'Total clicks: %(clicks)d', {
					args: { clicks },
				} ) }
			</div>
			<div>
				{ hasUniques
					? translate( 'Unique clicks: %(uniqueClicks)d (%(clickRate).2f%%)', {
							args: { uniqueClicks: clicksUnique, clickRate: clicksRate },
					  } )
					: translate( 'Unique clicks: —' ) }
			</div>
		</div>
	);
};
