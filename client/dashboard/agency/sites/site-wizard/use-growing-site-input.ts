import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { parseSiteList } from './site-intake';

export default function useGrowingSiteInput( value: string, onChange: ( value: string ) => void ) {
	const input = useRef< HTMLTextAreaElement >( null );
	const pendingCaret = useRef< number | null >( null );
	const isList = /[\r\n\t]/.test( value ) || parseSiteList( value ).sites.length > 1;
	const resize = useCallback( () => {
		const field = input.current;
		if ( ! field ) {
			return;
		}
		const styles = getComputedStyle( field );
		const borders = parseFloat( styles.borderTopWidth ) + parseFloat( styles.borderBottomWidth );
		const minHeight = parseFloat( styles.minHeight ) || 56;
		const maxHeight = parseFloat( styles.maxHeight ) || 280;
		const lineHeight = parseFloat( styles.lineHeight ) || 28;
		const minimum = isList ? minHeight + lineHeight : minHeight;
		field.style.height = '0px';
		field.style.height = `${ Math.min( maxHeight, Math.max( minimum, field.scrollHeight + ( borders || 0 ) ) ) }px`;
	}, [ isList ] );

	useLayoutEffect( () => {
		resize();
		if ( pendingCaret.current !== null ) {
			input.current?.setSelectionRange( pendingCaret.current, pendingCaret.current );
			pendingCaret.current = null;
		}
	}, [ value, resize ] );

	useEffect( () => {
		const field = input.current;
		if ( ! field || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		let width = field.clientWidth;
		const observer = new ResizeObserver( () => {
			if ( field.clientWidth !== width ) {
				width = field.clientWidth;
				resize();
			}
		} );
		observer.observe( field );
		return () => observer.disconnect();
	}, [ resize ] );

	const insertLine = () => {
		const field = input.current;
		if ( ! field ) {
			return;
		}
		const { selectionStart, selectionEnd } = field;
		pendingCaret.current = selectionStart + 1;
		onChange( `${ value.slice( 0, selectionStart ) }\n${ value.slice( selectionEnd ) }` );
	};
	return { input, isList, insertLine };
}
