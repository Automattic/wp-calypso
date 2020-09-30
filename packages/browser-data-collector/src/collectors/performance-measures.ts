/**
 * Internal dependencies
 */
import { getMeasures } from '../api/user-timing';

export const collector: Collector = ( report ) => {
	const measures = getMeasures();

	// As we don't know if any of the startMark or endMark are within this report timespan, we can't
	// filter them out.
	measures.forEach( ( measure ) => {
		const name = 'measure__' + measure.name.toLowerCase().replace( /\W/g, '_' );
		if ( ! report.data.has( name ) ) {
			report.data.set( name, Math.round( measure.duration ) );
		}
	} );

	return report;
};
