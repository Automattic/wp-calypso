import { Notice, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
const REFRESH_REPORT_INTERVAL = 24; // 24 hours

type ReportExpiredNotice = {
	onRetest: () => void;
	reportTimestamp?: string;
};

/**
 * Checks if the report should be refreshed based on the timestamp and refresh interval.
 * @param reportTimestamp - The timestamp of the report.
 * @param refreshInterval - The interval in hours to refresh the report.
 * @returns True if the report should be refreshed, false otherwise.
 */
function shouldRefreshReport( reportTimestamp: string, refreshInterval: number ): boolean {
	const now = new Date();
	const reportDate = new Date( reportTimestamp );

	if ( isNaN( reportDate.getTime() ) ) {
		return false;
	}

	const diffInMs = now.getTime() - reportDate.getTime();
	const diffInHours = diffInMs / ( 1000 * 60 * 60 );

	return diffInHours > refreshInterval;
}

export const ReportExpiredNotice = ( { onRetest, reportTimestamp }: ReportExpiredNotice ) => {
	const [ showExpiredReportNotice, setShowExpiredReportNotice ] = useState< boolean >( true );

	if ( ! showExpiredReportNotice ) {
		return null;
	}

	if ( ! reportTimestamp ) {
		return null;
	}

	if ( ! shouldRefreshReport( reportTimestamp, REFRESH_REPORT_INTERVAL ) ) {
		return null;
	}

	return (
		<Notice
			status="info"
			isDismissible
			onRemove={ () => {
				setShowExpiredReportNotice( false );
			} }
		>
			<p>
				<b>{ __( 'These results are more than 24 hours old' ) }</b>
			</p>
			<p>{ __( 'Test the page again if you have recently made updates to your site.' ) }</p>
			<Button variant="primary" onClick={ onRetest }>
				{ __( 'Test again' ) }
			</Button>
		</Notice>
	);
};
