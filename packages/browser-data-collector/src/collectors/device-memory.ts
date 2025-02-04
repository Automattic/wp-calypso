import { getMemory } from '../api/device-memory';
import type { Collector } from '../types';

export const collector: Collector = ( report ) => {
	report.data.set( 'memory', getMemory() );
	return report;
};
