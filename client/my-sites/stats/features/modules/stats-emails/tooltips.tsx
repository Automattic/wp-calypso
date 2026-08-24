import { Tooltip } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
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
	const sends = parseInt( String( item.total_sends ), 10 ) || 0;
	const opens = parseInt( String( item.opens ), 10 ) || 0;
	const hasUniques = hasUniqueMetrics( parseInt( String( item.unique_opens ), 10 ), opens );
	// A true zero (sent, nobody opened) is a known value too, so it reuses the
	// detailed line with zeros instead of introducing a new string.
	const uniquesKnown = hasUniques || ( sends > 0 && opens === 0 );

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sendsCountFormatted)s', {
					args: { sendsCountFormatted: formatNumber( item.total_sends ) },
				} ) }
			</div>
			{ /* The unavailable states explain themselves in the note below, so the
			     unique line only renders when there is a number to show. */ }
			{ uniquesKnown && (
				<div>
					{ translate( 'Unique opens: %(uniqueOpensCountFormatted)s (%(opensRate)s%)', {
						args: {
							uniqueOpensCountFormatted: formatNumber( item.unique_opens ),
							opensRate: formatNumber( item.opens_rate, {
								numberFormatOptions: { maximumFractionDigits: 2 },
							} ),
						},
					} ) }
				</div>
			) }
			{ sends === 0 && (
				<div className="stats-email__tooltip-note">
					{ translate( 'No delivery data for this email.' ) }
				</div>
			) }
			{ sends > 0 && ! hasUniques && opens > 0 && (
				<div className="stats-email__tooltip-note">
					{ translate( "Opens weren't linked to recipients." ) }
				</div>
			) }
		</div>
	);
};

export const ClicksTooltipContent: React.FC< { item: EmailStatsItem } > = ( { item } ) => {
	const translate = useTranslate();
	const sends = parseInt( String( item.total_sends ), 10 ) || 0;
	const clicks = parseInt( String( item.clicks ), 10 ) || 0;
	const hasUniques = hasUniqueMetrics( parseInt( String( item.unique_clicks ), 10 ), clicks );
	// Same as the opens tooltip: a true zero is a known value.
	const uniquesKnown = hasUniques || ( sends > 0 && clicks === 0 );

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sendsCountFormatted)s', {
					args: { sendsCountFormatted: formatNumber( item.total_sends ) },
				} ) }
			</div>
			{ /* Same rule as the opens tooltip: numbers only, the note covers the rest. */ }
			{ uniquesKnown && (
				<div>
					{ translate( 'Unique clicks: %(uniqueClicksCountFormatted)s (%(clicksRate)s%)', {
						args: {
							uniqueClicksCountFormatted: formatNumber( item.unique_clicks ),
							clicksRate: formatNumber( item.clicks_rate, {
								numberFormatOptions: { maximumFractionDigits: 2 },
							} ),
						},
					} ) }
				</div>
			) }
			{ sends === 0 && (
				<div className="stats-email__tooltip-note">
					{ translate( 'No delivery data for this email.' ) }
				</div>
			) }
			{ sends > 0 && ! hasUniques && clicks > 0 && (
				<div className="stats-email__tooltip-note">
					{ translate( "Clicks weren't linked to recipients." ) }
				</div>
			) }
		</div>
	);
};
