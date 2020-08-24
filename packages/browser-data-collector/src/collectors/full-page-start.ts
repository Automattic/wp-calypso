/**
 * Internal dependencies
 */
import { getNavigationStart } from '../api/performance-timing';

export const collector: Collector = ( report ) => {
	report.beginning = getNavigationStart();
	report.data.set( 'fullPage', true );
	return report;
};
