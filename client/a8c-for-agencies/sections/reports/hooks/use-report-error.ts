import { useTranslate } from 'i18n-calypso';
import type { Report } from '../types';

export const useReportError = ( reportData?: Report ) => {
	const translate = useTranslate();

	// Get the latest error from the report data
	const reportError = reportData?.data?.errors?.reduce(
		( latest, error ) => {
			if ( ! latest || error.timestamp > latest.timestamp ) {
				return error;
			}
			return latest;
		},
		null as { code: string; message: string; timestamp: number } | null
	);

	const getErrorText = ( errorCode?: string ) => {
		switch ( errorCode ) {
			case 'report_empty_data':
				return translate(
					'No data found for this timeframe. The site may be new, inactive, or missing Jetpack (required for reports). Try another date range or install Jetpack to see results.'
				);
			default:
				return translate( 'There was an error preparing your report.' );
		}
	};

	const errorText = getErrorText( reportError?.code );

	return {
		errorText,
		errorCode: reportError?.code,
	};
};
