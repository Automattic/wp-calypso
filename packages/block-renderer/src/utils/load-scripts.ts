const loadScript = async ( element: HTMLElement, { id, src, textContent }: HTMLScriptElement ) => {
	return new Promise( ( resolve ) => {
		const script = element.ownerDocument.createElement( 'script' ) as HTMLScriptElement;
		script.id = id;
		if ( src ) {
			script.src = src;
			script.onload = () => resolve( script );
			script.onerror = () => {
				// eslint-disable-next-line no-console
				console.warn( `Error while loading the script: ${ src }` );

				// Resolve the promise to ignore the error.
				resolve( script );
			};
		} else {
			script.textContent = textContent;
			resolve( script );
		}

		element.appendChild( script );
	} );
};

const loadScripts = async ( element: HTMLElement, scripts: HTMLScriptElement[] ) => {
	return scripts.reduce(
		( promise, script ): Promise< any > => promise.then( () => loadScript( element, script ) ),
		Promise.resolve()
	);
};

export default loadScripts;
