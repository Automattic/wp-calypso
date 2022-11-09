/**
 * Updates the express request context with a new performance mark.
 *
 * This pushes a new "performance mark" object to the array of performance marks.
 * This object includes the current time to note when this step of the pipeline
 * started. We also update the previous mark with its duration. (E.g. we expect
 * each mark to happen in serial, with the previous step ending as the new one begins.)
 *
 * Unfortunately, due to how express passes around the request object, this modifies
 * the request context by reference.
 *
 * @param {object}  req      The express request object.
 * @param {string}  markName A name for the marker being logged.
 * @param {boolean} isChild  Optionally note this occured as part of a different mark.
 */
export default function performanceMark( req, markName, isChild = false ) {
	if ( ! req.context ) {
		return;
	}

	req.context.performanceMarks ??= [];

	// Quick reference to the array for less verbosity.
	const perfMarks = req.context.performanceMarks;
	const currentTime = Date.now();
	const newMark = { markName, startTime: currentTime };

	// Create an array of steps on the active mark if necessary.
	if ( isChild && perfMarks.length ) {
		perfMarks[ perfMarks.length - 1 ].steps ??= [];
	}

	// If adding a child, we want to operate on the active marker's steps array.
	// Otherwise, we're just adding a normal mark to the top-level array.
	const targetArray =
		isChild && perfMarks.length ? perfMarks[ perfMarks.length - 1 ].steps : perfMarks;

	// Mark the duration of the previous marker if a mark exists to be updated.
	finalizeDuration( targetArray, currentTime );

	targetArray.push( newMark );
}

/**
 * Finalize the duration of any active marks and return the final array of data.
 *
 * @param {object} req The express request object.
 * @returns array The array of finalized performance marks.
 */
export function finalizePerfMarks( req ) {
	// Do nothing if there are no marks.
	if ( ! req?.context?.performanceMarks?.length ) {
		return [];
	}

	finalizeDuration( req.context.performanceMarks, Date.now() );
	return req.context.performanceMarks;
}

function finalizeDuration( markArr, currentTime ) {
	if ( ! markArr?.length ) {
		return;
	}

	const lastMarker = markArr[ markArr.length - 1 ];
	lastMarker.duration ??= currentTime - lastMarker.startTime;

	// Do the same thing to the active mark's step array.
	finalizeDuration( lastMarker.steps, currentTime );
}
