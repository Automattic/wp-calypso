export function getAccessibleLogoText( logoElement: Element | null ) {
	if ( ! logoElement || ! ( logoElement instanceof Element ) ) {
		return undefined;
	}

	// Case: <img>
	if ( logoElement.tagName.toLowerCase() === 'img' ) {
		return (
			( logoElement as HTMLImageElement ).alt ||
			logoElement.getAttribute( 'aria-label' ) ||
			logoElement.getAttribute( 'title' ) ||
			undefined
		);
	}

	// Case: <svg>
	if ( logoElement.tagName.toLowerCase() === 'svg' ) {
		// Try aria-label directly on <svg>
		const label = logoElement.getAttribute( 'aria-label' );
		if ( label ) {
			return label;
		}

		// Try <title> or <desc> elements inside SVG
		const title = logoElement.querySelector( 'title' );
		if ( title && title.textContent ) {
			return title.textContent.trim();
		}

		const desc = logoElement.querySelector( 'desc' );
		if ( desc && desc.textContent ) {
			return desc.textContent.trim();
		}

		// Try title attribute as fallback
		const titleAttr = logoElement.getAttribute( 'title' );
		if ( titleAttr ) {
			return titleAttr;
		}

		return undefined;
	}

	// For other types of elements, try common accessibility attributes
	return (
		logoElement.getAttribute( 'aria-label' ) ||
		logoElement.getAttribute( 'title' ) ||
		logoElement.textContent?.trim() ||
		undefined
	);
}
