import { getCalypsoVersion, getTarget, getEnvironment } from '../api/environment';
import type { Collector } from '../types';

export const collector: Collector = ( report ) => {
	report.data.set( 'version', getCalypsoVersion() );
	report.data.set( 'target', getTarget() );
	report.data.set( 'env', getEnvironment() );
	return report;
};
