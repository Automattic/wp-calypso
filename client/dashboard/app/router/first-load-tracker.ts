let isFirstLoad = true;

/**
 * Returns true if this is the first page load, without consuming the flag.
 * Use in beforeLoad handlers where the root route may re-run on internal redirects.
 */
export function peekFirstLoad(): boolean {
	return isFirstLoad;
}

/**
 * Returns true if this is the first page load, and consumes the flag so subsequent
 * calls return false. Call this when actually starting a performance measurement.
 */
export function consumeFirstLoad(): boolean {
	if ( isFirstLoad ) {
		isFirstLoad = false;
		return true;
	}
	return false;
}
