/**
 * External Dependencies
 */
import React from 'react';
import { usePopper } from 'react-popper';

type PopperProps = Partial< Pick< ReturnType< typeof usePopper >, 'styles' | 'attributes' > >;

/**
 * A hook that returns Popper styles and attributes to apply at the given reference element to reposition.
 *
 * @param referenceElementSelector The selector to reposition popperElementRef around (e.g. a button/section in a page)
 * @param popperElementRef A reference to the element we want to reposition (e.g. this would be the tour-container)
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
