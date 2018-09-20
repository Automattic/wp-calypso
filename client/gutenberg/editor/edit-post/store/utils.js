/**
 * Given a selector returns a functions that returns the listener only
 * if the returned value from the selector changes.
 *
 * @param  {function} selector Selector.
 * @param  {function} listener Listener.
 * @return {function}          Listener creator.
 */
export const onChangeListener = ( selector, listener ) => {
	let previousValue = selector();
	return () => {
		const selectedValue = selector();
		if ( selectedValue !== previousValue ) {
			previousValue = selectedValue;
			listener( selectedValue );
		}
	};
};
