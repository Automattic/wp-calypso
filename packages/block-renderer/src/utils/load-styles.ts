const loadStyle = async (
	element: HTMLElement,
	{ tagName, id, href, rel, media, textContent }: HTMLLinkElement
) => {
	return new Promise( ( resolve, reject ) => {
		const style = element.ownerDocument.createElement( tagName ) as HTMLLinkElement;
		style.id = id;
		if ( href ) {
			style.href = href;
			style.rel = rel;
			style.media = media;
			style.onload = () => resolve( style );
			style.onerror = () => reject();
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
