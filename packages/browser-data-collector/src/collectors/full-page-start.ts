import { getNavigationStart } from '../api/performance-timing';
import type { Collector } from '../types';

export const collector: Collector = ( report ) => {
	report.beginning = getNavigationStart();
	report.data.set( 'fullPage', true );
	return report;
};
