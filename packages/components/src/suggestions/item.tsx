import clsx from 'clsx';
import { escapeRegExp } from 'lodash';
import { useEffect, memo, forwardRef } from 'react';
import type { ForwardRefRenderFunction, FocusEvent, MouseEvent } from 'react';

function escapeRegExpWithSpace( str: string ) {
	return escapeRegExp( str ).replace( /\s/g, '\\s' );
}

const createTextWithHighlight = ( text: string, query: string ) => {
	const re = new RegExp( '(' + escapeRegExpWithSpace( query ) + ')', 'gi' );
	const parts = text.split( re );

	// Replaces char code 160 (&nbsp;) with 32 (space)
	const match = query.toLowerCase().replace( /\s/g, ' ' );

	return parts.map( ( part, i ) => {
		const key = text + i;
		const lowercasePart = part.toLowerCase();
		const spanClass = clsx( 'suggestions__label', {
			'is-emphasized': lowercasePart === match,
		} );

		return (
			<span key={ key } className={ spanClass }>
				{ part }
			</span>
		);
	} );
};

type Props = {
	label: string;
	hasHighlight?: boolean;
	query?: string;
	onMount: () => void;
	onMouseDown: () => void;
	onMouseOver: () => void;
};

const Item: ForwardRefRenderFunction< HTMLButtonElement, Props > = (
	{ label, hasHighlight = false, query = '', onMount, onMouseDown, onMouseOver },
	forwardedRef
) => {
	useEffect( () => {
		onMount();
		// Disable reason: We don't want to re-fire `onMount` if it changes, literally only fire it onMount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const handleMouseDown = ( event: MouseEvent | FocusEvent ) => {
		event.stopPropagation();
		event.preventDefault();
		onMouseDown();
	};

	const className = clsx( 'suggestions__item', { 'has-highlight': hasHighlight } );

	return (
		<button
			className={ className }
			onMouseDown={ handleMouseDown }
			onFocus={ handleMouseDown }
			onMouseOver={ onMouseOver }
			ref={ forwardedRef }
		>
			{ createTextWithHighlight( label, query ) }
		</button>
	);
};

export default memo( forwardRef( Item ) );
