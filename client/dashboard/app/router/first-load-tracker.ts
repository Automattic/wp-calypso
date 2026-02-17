/**
 * Used for detecting whether a navigation is a fresh page load (see `./root.tsx`)
 * @returns true if this function hasn't been called before.
 */
export const consumeFirstLoad = ( () => {
	let isFirstLoad = true;
	return () => {
		if ( isFirstLoad ) {
			isFirstLoad = false;
			return true;
		}
		return false;
	};
} )();
