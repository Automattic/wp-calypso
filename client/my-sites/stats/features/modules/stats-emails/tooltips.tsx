import { Tooltip } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import React, { useRef, useState } from 'react';
import { isRateKnown, toCount } from './is-rate-known';

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

export const OpensTooltipContent: React.FC< { item: EmailStatsItem } > = ( { item } ) => {
	const translate = useTranslate();
	const sends = toCount( item.total_sends );
	const opens = toCount( item.opens );
	// The same rule the cell uses, so the tooltip never shows a rate the cell
	// just declared unknown. A true zero reuses the detailed line with zeros
	// instead of introducing a new string.
	const rateKnown = isRateKnown( { uniques: toCount( item.unique_opens ), totals: opens, sends } );

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sendsCountFormatted)s', {
					args: { sendsCountFormatted: formatNumber( item.total_sends ) },
				} ) }
			</div>
			{ /* The unavailable states explain themselves in the note below, so the
			     unique line only renders when the rate is a known value. */ }
			{ rateKnown && (
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
			{ sends > 0 && ! rateKnown && (
				<div className="stats-email__tooltip-note">
					{ translate( "Opens weren't linked to recipients." ) }
				</div>
			) }
		</div>
	);
};

export const ClicksTooltipContent: React.FC< { item: EmailStatsItem } > = ( { item } ) => {
	const translate = useTranslate();
	const sends = toCount( item.total_sends );
	const clicks = toCount( item.clicks );
	// Same rule as the cell; see OpensTooltipContent.
	const rateKnown = isRateKnown( {
		uniques: toCount( item.unique_clicks ),
		totals: clicks,
		sends,
	} );

	return (
		<div className="stats-email__tooltip">
			<div>
				{ translate( 'Recipients: %(sendsCountFormatted)s', {
					args: { sendsCountFormatted: formatNumber( item.total_sends ) },
				} ) }
			</div>
			{ /* Same rule as the opens tooltip: numbers only, the note covers the rest. */ }
			{ rateKnown && (
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
			{ sends > 0 && ! rateKnown && (
				<div className="stats-email__tooltip-note">
					{ translate( "Clicks weren't linked to recipients." ) }
				</div>
			) }
		</div>
	);
};
