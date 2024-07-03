import { getEffectiveType } from '../api/network-information';
import type { Collector } from '../types';

export const collector: Collector = ( report ) => {
	report.data.set( 'network', getEffectiveType() );
	return report;
};
