/**
 * Internal dependencies
 */
import { getMemory } from '../api/device-memory';

export const collector: Collector = ( report ) => {
	report.data.set( 'memory', getMemory() );
	return report;
};
