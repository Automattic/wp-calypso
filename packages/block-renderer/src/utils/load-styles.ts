const loadStyle = async (
	element: HTMLElement,
	{ tagName, id, href, rel, media, textContent }: HTMLLinkElement
) => {
	return new Promise( ( resolve ) => {
		const style = element.ownerDocument.createElement( tagName ) as HTMLLinkElement;
		style.id = id;
		if ( href ) {
			style.href = href;
			style.rel = rel;
			style.media = media;
			style.onload = () => resolve( style );
			style.onerror = () => {
				// eslint-disable-next-line no-console
				console.warn( `Error while loading the CSS: ${ href }` );

				// Resolve the promise to ignore the error.
				resolve( style );
			};
		} else {
			style.textContent = textContent;
			resolve( style );
		}

		element.appendChild( style );
	} );
};

const loadStyles = async ( element: HTMLElement, styles: HTMLLinkElement[] ) => {
	return styles.reduce(
		( promise, style ): Promise< any > => promise.then( () => loadStyle( element, style ) ),
		Promise.resolve()
	);
};

export default loadStyles;
