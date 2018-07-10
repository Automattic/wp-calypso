/**
 * Clear the a11y-speak-region elements.
 */
const clear = function() {
	const regions = document.querySelectorAll( '.a11y-speak-region' );
	for ( let i = 0; i < regions.length; i++ ) {
		regions[ i ].textContent = '';
	}
};

export default clear;
