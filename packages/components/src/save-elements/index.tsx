import { useLayoutEffect, useRef, ReactElement } from 'react';
import { render, hydrate } from 'react-dom';

const storageDiv = document.createElement( 'div' );
storageDiv.id = 'storage';
storageDiv.style.display = 'none';
document.body.appendChild( storageDiv );

const storageMap = new Map< string, HTMLElement >();
( window as any ).debugStorageMap = storageMap;

export default function SaveElements( {
	storageKey,
	children,
}: {
	storageKey: string;
	children: ReactElement;
} ) {
	const divEl = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		const el = divEl.current;
		if ( ! el ) {
			return;
		}

		// const storedDiv = document.getElementById( storageKey );
		const storedDiv = storageMap.get( storageKey );

		let elementToStore: HTMLElement | null = null;

		if ( storedDiv ) {
			el.appendChild( storedDiv );
			hydrate( children, storedDiv );
			elementToStore = storedDiv;
		} else {
			const newDiv = document.createElement( 'div' );
			newDiv.id = storageKey;
			storageMap.set( storageKey, newDiv );
			el.appendChild( newDiv );
			render( children, newDiv );
			elementToStore = newDiv;
		}

		return () => {
			if ( elementToStore ) {
				// document.getElementById( 'storage' )?.appendChild( elementToStore );
			}
		};
	} );

	return <div ref={ divEl } />;
}
