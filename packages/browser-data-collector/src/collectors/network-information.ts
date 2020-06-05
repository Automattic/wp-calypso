/**
 * Internal dependencies
 */
import { getEffectiveType } from '../api/network-information';

export const collector: Collector = ( report ) => {
	report.data.set( 'network', getEffectiveType() );
	return report;
};
