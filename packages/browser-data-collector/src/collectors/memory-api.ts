/**
 * Internal dependencies
 */
import type { Collector } from './collector';
import { getMemory } from '../api/device-memory';

export const collector: Collector = ( report ) => {
	report.data.set( 'memory', getMemory() );
	return report;
};
