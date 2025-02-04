import type { Collector } from '../types';

export const collector: Collector = ( report ) => {
	report.beginning = Date.now();
	report.data.set( 'fullPage', false );
	return report;
};
