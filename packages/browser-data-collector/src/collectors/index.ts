/**
 * Internal dependencies
 */
import { collector as deviceMemory } from './device-memory';
import { collector as performanceTiming } from './performance-timing';
import { collector as environment } from './environment';

const globalCollectors = [ deviceMemory, performanceTiming, environment ];

export const applyGlobalCollectors = async ( report: Report ) => {
	for ( const collector of globalCollectors ) {
		report = await collector( report );
	}
	return report;
};
