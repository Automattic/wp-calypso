import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Notice,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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

export default function ReportExpiredNotice( { onRetest, reportTimestamp }: ReportExpiredNotice ) {
	if ( ! reportTimestamp ) {
		return null;
	}

	if ( ! shouldRefreshReport( reportTimestamp, REFRESH_REPORT_INTERVAL ) ) {
		return null;
	}

	return (
		<div style={ { marginBottom: '32px' } }>
			<Notice status="warning" isDismissible={ false }>
				<HStack spacing={ 2 } justify="space-between">
					<VStack spacing={ 2 }>
						<Text>
							<b>{ __( 'These results are more than 24 hours old' ) }</b>
						</Text>
						<Text>
							{ __( 'Test the page again if you have recently made updates to your site.' ) }
						</Text>
					</VStack>
					<Button variant="primary" onClick={ onRetest }>
						{ __( 'Test again' ) }
					</Button>
				</HStack>
			</Notice>
		</div>
	);
}
