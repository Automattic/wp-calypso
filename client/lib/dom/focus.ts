/**
 * Return the focusable children of an HTML element
 * @param {HTMLElement} parent HTML element to get the focusable children from
 * @returns {HTMLElement[]} Collection of focusable elements
 */
export function getFocusableElements( parent: HTMLElement ): NodeListOf< HTMLElement > {
	return parent.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);
}

/**
 * Return the last focusable child of an HTML element
 * @param {HTMLElement} parent HTML element to get the focusable child from
 * @returns {HTMLElement} Last focusable child
 */
export function getLastFocusableElement( parent: HTMLElement ): HTMLElement | undefined {
	const focusableElts = getFocusableElements( parent );

	return focusableElts.length > 0 ? focusableElts[ focusableElts.length - 1 ] : undefined;
}
