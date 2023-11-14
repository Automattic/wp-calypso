type PerformanceMark = {
	markName: string;
	startTime: number;
	duration?: number;
	steps?: PerformanceMark[];
};

export type PartialContext = {
	performanceMarks?: PerformanceMark[];
};

type LogstashMark = {
	total_duration: number;
} & Record< string, number >;

type LogstashPerfMarks = Record< string, LogstashMark >;

/**
 * Updates the express request context with a new performance mark.
 *
 * IMPORTANT: The markName and / or children should be static. E.g. a child marker
 * should always occur under the same parent, and any marker name should not encode
 * any dynamic data. This is a limitation of logstash indices, where there can
 * only be so many keys for a single index.
 *
 * This pushes a new "performance mark" object to the array of performance marks.
 * This object includes the current time to note when this step of the pipeline
 * started. We also update the previous mark with its duration. (E.g. we expect
 * each mark to happen in serial, with the previous step ending as the new one begins.)
 *
 * Unfortunately, due to how express passes around the request object, this modifies
 * the request context by reference.
 * @param context  The request.context object.
 * @param markName A name for the marker being logged.
 * @param isChild  Optionally note this occured as part of a different mark.
 */
export default function performanceMark(
	context: PartialContext,
	markName: string,
	isChild = false
) {
	if ( ! context ) {
		return;
	}

	context.performanceMarks ??= [];

	// Quick reference to the array for less verbosity.
	const perfMarks = context.performanceMarks;
	const currentTime = Date.now();
	const newMark = { markName, startTime: currentTime };

	// Create an array of steps on the active mark if necessary.
	if ( isChild && perfMarks.length ) {
		perfMarks[ perfMarks.length - 1 ].steps ??= [];
	}

	// If adding a child, we want to operate on the active marker's steps array.
	// Otherwise, we're just adding a normal mark to the top-level array.
	const targetArray =
		isChild && perfMarks.length
			? ( perfMarks[ perfMarks.length - 1 ].steps as PerformanceMark[] ) // Was set to an array above.
			: perfMarks;

	// Mark the duration of the previous marker if a mark exists to be updated.
	finalizeDuration( targetArray, currentTime );

	targetArray.push( newMark );
}

/**
 * Finalize the duration of any active marks and return the final array of data.
 * @param context The request.context object.
 * @returns object The normalized mark data for logstash in object format.
 */
export function finalizePerfMarks( context: PartialContext ): LogstashPerfMarks {
	// Do nothing if there are no marks.
	if ( ! context?.performanceMarks?.length ) {
		return {};
	}

	finalizeDuration( context.performanceMarks, Date.now() );

	// Logstash cannot accept arrays, so we transform our array into a more
	// friendly structure for it.
	return context.performanceMarks.reduce( ( marks: LogstashPerfMarks, mark ) => {
		const markKey = markNameToKey( mark.markName );
		// A mark like "setup request" becomes "0_setup_request"
		marks[ markKey ] = {
			total_duration: mark.duration as number, // All durations exist after "finalizeDuration"
		};

		mark.steps?.forEach( ( { markName, duration } ) => {
			marks[ markKey ][ markNameToKey( markName ) ] = duration as number; // All durations exist after "finalizeDuration"
		} );
		return marks;
	}, {} );
}

function markNameToKey( name: string ) {
	// Note: it would be nice to include an index in the name to better know the
	// step. However, since indices can change, this would likely create to many
	// possible keys for the logstash index. As a result, we only use the name.
	// This way, the number of possible keys in logstash exactly matches the number
	// of performanceMark calls in Calypso.
	return `${ name.replace( /[- ]/g, '_' ) }`;
}

function finalizeDuration( markArr: PerformanceMark[] | undefined, currentTime: number ) {
	if ( ! markArr?.length ) {
		return;
	}

	const lastMarker = markArr[ markArr.length - 1 ];
	lastMarker.duration ??= currentTime - lastMarker.startTime;

	// Do the same thing to the active mark's step array.
	finalizeDuration( lastMarker.steps, currentTime );
}
