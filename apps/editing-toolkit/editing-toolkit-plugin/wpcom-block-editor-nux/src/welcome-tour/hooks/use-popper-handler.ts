/**
 * External Dependencies
 */
import React from 'react';
import { usePopper } from 'react-popper';

type PopperProps = Partial< Pick< ReturnType< typeof usePopper >, 'styles' | 'attributes' > >;

/**
 * A hook that returns Popper styles and attributes to apply at the given reference element to reposition.
 *
 * @param referenceElementSelector The element selector to reposition popper-element around (e.g. a button/section on the page)
 * @param popperElementRef Reference to element we want to reposition (e.g. the tour-frame)
 */
const usePopperHandler = (
	referenceElementSelector: string,
	popperElementRef: React.MutableRefObject< null | HTMLElement >
): PopperProps => {
	const referenceElement = document.querySelector( referenceElementSelector );
	const { styles, attributes } = usePopper( referenceElement, popperElementRef?.current, {
		strategy: 'fixed',
		modifiers: [
			{
				name: 'preventOverflow',
				options: {
					rootBoundary: 'document',
					padding: 16, // same as the left/margin of the tour frame
				},
			},
		],
	} );

	return referenceElement ? { styles, attributes } : {};
};

export default usePopperHandler;
