import { type BadgeType, Gridicon, Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { getTimeframeText } from 'calypso/a8c-for-agencies/sections/reports/lib/timeframes';
import FormattedDate from 'calypso/components/formatted-date';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import type { ReportStatus } from '../../types';

export const ReportSiteColumn = ( { site }: { site: string } ) => urlToSlug( site );

export const ReportCountColumn = ( { count }: { count: number } ) => {
	const translate = useTranslate();
	return (
		<span className="reports-list__count">
			{ translate( '%(count)d report', '%(count)d reports', {
				count,
				args: { count },
			} ) }
		</span>
	);
};

export const ReportStatusColumn = ( { status }: { status: ReportStatus } ) => {
	const translate = useTranslate();

	const statusConfig = {
		pending: { type: 'info', text: translate( 'Preparing' ) },
		processed: { type: 'success', text: translate( 'Ready to send' ) },
		sent: { type: 'success', text: translate( 'Sent' ) },
		error: { type: 'error', text: translate( 'Error' ) },
	};

	const config = statusConfig[ status ];

	if ( ! config ) {
		return <Gridicon icon="minus" />;
	}

	return <StatusBadge statusProps={ { children: config.text, type: config.type as BadgeType } } />;
};

export const ReportDateColumn = ( { date }: { date: number | null } ) => {
	if ( ! date ) {
		return <Gridicon icon="minus" />;
	}

	const dateObj = new Date( date * 1000 );
	return <FormattedDate date={ dateObj } format="DD MMM YYYY HH:mm" />;
};

export const ReportTimeframeColumn = ( {
	timeframe,
	startDate,
	endDate,
}: {
	timeframe: string;
	startDate?: string;
	endDate?: string;
} ) => {
	const translate = useTranslate();
	const tooltipRef = useRef( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const timeframeText = getTimeframeText( timeframe, translate );

	// Show tooltip with date range for custom timeframes
	if ( timeframe === 'custom' && startDate && endDate ) {
		const startDateObj = new Date( startDate );
		const endDateObj = new Date( endDate );

		return (
			<>
				<span
					onMouseEnter={ () => setShowTooltip( true ) }
					onMouseLeave={ () => setShowTooltip( false ) }
					onMouseDown={ () => setShowTooltip( false ) }
					role="button"
					tabIndex={ 0 }
					ref={ tooltipRef }
				>
					{ timeframeText }
				</span>
				<Tooltip context={ tooltipRef.current } isVisible={ showTooltip } position="top">
					<FormattedDate date={ startDateObj } format="DD MMM YYYY" /> -
					<FormattedDate date={ endDateObj } format="DD MMM YYYY" />
				</Tooltip>
			</>
		);
	}

	return timeframeText;
};
