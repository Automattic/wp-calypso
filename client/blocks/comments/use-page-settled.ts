import { useEffect, useState } from 'react';

let settled: Promise< void > | undefined;

// Once the page has loaded and the browser has a quiet moment, so the comment editor's
// downloads don't compete with the Reader's own.
const whenSettled = () =>
	( settled ??= new Promise( ( resolve ) => {
		const wait = () =>
			window.requestIdleCallback
				? window.requestIdleCallback( () => resolve(), { timeout: 5000 } )
				: setTimeout( resolve, 2000 );

		if ( document.readyState === 'complete' ) {
			wait();
		} else {
			window.addEventListener( 'load', wait, { once: true } );
		}
	} ) );

export function usePageSettled() {
	const [ isSettled, setSettled ] = useState( false );

	useEffect( () => {
		let live = true;
		whenSettled().then( () => live && setSettled( true ) );
		return () => {
			live = false;
		};
	}, [] );

	return isSettled;
}
