/**
 * Internal dependencies
 */
import { getMarks } from '../api/user-timing';

export const collector: Collector = ( report ) => {
	const marks = getMarks();

	// All data in the report is expected to be relative to `navigationStart`.
	//
	// mark.startTime is when the mark was craeted relative to the "time origin", which should
	// be recorded in `performance.timeOrigin` but not all browsers supports it. However,
	// `navigationStart` is reasonably close, therefore we don't need to correct `startTime`
	marks.forEach( ( mark ) => {
		const name = 'mark__' + mark.name.toLowerCase().replace( /\W/g, '_' );
		if ( ! report.data.has( name ) ) {
			report.data.set( name, Math.round( mark.startTime ) );
		}
	} );

	return report;
};
