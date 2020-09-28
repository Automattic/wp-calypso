/**
 * Internal dependencies
 */
import { getMeasures } from '../api/user-timing';

export const collector: Collector = ( report ) => {
	const measures = getMeasures();

	// As we don't know if any of the startMark or endMark are within this report timespan, we can't
	// filter them out.
	measures.forEach( ( measure ) => {
		report.data.set(
			'measure__' + measure.name.toLowerCase().replace( /\W/g, '_' ),
			Math.round( measure.duration )
		);
	} );

	return report;
};
