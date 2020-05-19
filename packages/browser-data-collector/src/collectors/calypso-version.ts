/**
 * Internal dependencies
 */
import { getCalypsoVersion } from '../api/calypso-version';

export const collector: Collector = ( report ) => {
	report.data.set( 'version', getCalypsoVersion() );
	return report;
};
