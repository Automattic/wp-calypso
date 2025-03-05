import { useState, useEffect } from 'react';

/**
 * Custom hook to read CSS variables
 *
 * @param variableName - The CSS variable name (including the -- prefix)
 * @param element - The element to read the variable from (defaults to :root)
 * @param observe - Whether to observe for changes to the variable
 * @returns The value of the CSS variable
 *
 * @example
 * // Basic usage
 * const primaryColor = useCssVariable('--primary-color');
 *
 * @example
 * // Reading from a specific element and observing changes
 * const headerHeight = useCssVariable('--header-height', headerRef.current, true);
 */
function useCssVariable(
	variableName: string,
	element: Element | null = typeof document !== 'undefined' ? document.documentElement : null,
	observe: boolean = false
): string {
	const [ value, setValue ] = useState< string >( '' );

	useEffect( () => {
		// Check if we're in a browser environment
		if ( typeof window === 'undefined' ) {
			return;
		}

		// Make sure the element exists
		if ( ! element ) {
			return;
		}

		// Function to get the current value of the CSS variable
		const updateValue = (): void => {
			const styles = window.getComputedStyle( element );
			const newValue = styles.getPropertyValue( variableName ).trim();
			setValue( newValue );
		};

		// Get the initial value
		setTimeout( updateValue, 200 );

		// Set up observer for changes if requested
		if ( observe ) {
			const observer = new MutationObserver( ( mutations: MutationRecord[] ): void => {
				mutations.forEach( ( mutation: MutationRecord ): void => {
					if (
						mutation.type === 'attributes' &&
						( mutation.attributeName === 'style' || mutation.attributeName === 'class' )
					) {
						updateValue();
					}
				} );
			} );

			observer.observe( element, {
				attributes: true,
				attributeFilter: [ 'style', 'class' ],
			} );

			// Clean up observer when component unmounts
			return () => observer.disconnect();
		}
	}, [ variableName, element, observe ] );

	return value;
}

export default useCssVariable;
