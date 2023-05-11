const loadScript = async ( element: HTMLElement, { id, src, textContent }: HTMLScriptElement ) => {
	return new Promise( ( resolve, reject ) => {
		const script = element.ownerDocument.createElement( 'script' ) as HTMLScriptElement;
		script.id = id;
		if ( src ) {
			script.src = src;
			script.onload = () => resolve( script );
			script.onerror = ( error ) => reject( error );
		} else {
			script.textContent = textContent;
			resolve( script );
		}

		element.appendChild( script );
	} );
};

const loadScripts = async ( element: HTMLElement, scripts: HTMLScriptElement[] ) => {
	return scripts.reduce(
		( promise, script ): Promise< any > =>
			promise
				// eslint-disable-next-line no-console
				.catch( ( error: Error ) => console.error( error ) )
				.then( () => loadScript( element, script ) ),
		Promise.resolve()
	);
};

export default loadScripts;
