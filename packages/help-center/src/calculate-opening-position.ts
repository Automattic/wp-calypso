/**
 * This function calculates the position of the Help Center based on the last click event
 *
 * @param lastClickEvent MouseEvent object
 * @param HelpCenter node reference
 * @returns object with left and top properties
 */
export const calculateOpeningPosition = ( lastClickEvent: MouseEvent, HelpCenter: HTMLElement ) => {
	const { clientX, clientY } = lastClickEvent;
	const { innerWidth, innerHeight } = window;
	const { offsetWidth, offsetHeight } = HelpCenter;

	let left = clientX - offsetWidth / 2;
	let top = clientY + 25;

	if ( clientX + offsetWidth / 2 > innerWidth ) {
		// In case the click was too close to the right edge of the screen, we move it to the left
		left = innerWidth - offsetWidth - 25;
	} else if ( left < 0 ) {
		// In case the click was too close to the left edge of the screen, we move it to the right
		left = 25;
	}

	if ( clientY + offsetHeight > innerHeight ) {
		// In case the click was too close to the bottom edge of the screen, we move it to the top
		top = clientY - offsetHeight - 25;
	}

	return {
		left: left,
		top: top,
	};
};
