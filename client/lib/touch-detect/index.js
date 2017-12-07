/** @format */
export const hasTouch = function() {
	/* global DocumentTouch:true */
	return (
		window &&
		( 'ontouchstart' in window || ( window.DocumentTouch && document instanceof DocumentTouch ) )
	);
};
