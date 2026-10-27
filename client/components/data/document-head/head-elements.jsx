import isEqual from 'fast-deep-equal/es6';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

function matchesMeta( element, props ) {
	const attributes = Object.entries( props ).filter( ( [ name ] ) => name !== 'content' );
	return (
		attributes.length > 0 &&
		attributes.every(
			( [ name, value ] ) =>
				element.getAttribute( name === 'httpEquiv' ? 'http-equiv' : name ) === String( value )
		)
	);
}

function matchesLink( element, props ) {
	if ( props.rel === 'canonical' ) {
		return element.getAttribute( 'rel' ) === 'canonical';
	}
	return Object.entries( props ).every(
		( [ name, value ] ) => element.getAttribute( name ) === String( value )
	);
}

export default function DocumentHeadElements( { meta, link } ) {
	const [ isMounted, setIsMounted ] = useState( false );
	const links = useMemo( () => {
		if ( ! link ) {
			return [];
		}
		const entries = Array.isArray( link ) ? link : [ link ];
		return entries.filter(
			( entry, index ) => entries.findIndex( ( other ) => isEqual( entry, other ) ) === index
		);
	}, [ link ] );

	useEffect( () => {
		// Keep server metadata not supplied by this component, such as route-specific noindex tags.
		document.head.querySelectorAll( '[data-calypso-document-head]' ).forEach( ( element ) => {
			const matches =
				element.tagName === 'META'
					? meta?.some( ( props ) => matchesMeta( element, props ) )
					: links.some( ( props ) => matchesLink( element, props ) );
			if ( matches ) {
				element.remove();
			}
		} );
		setIsMounted( true );
	}, [ meta, links ] );

	if ( ! isMounted ) {
		return null;
	}

	return createPortal(
		<>
			{ meta?.map( ( props, index ) => (
				<meta { ...props } key={ index } />
			) ) }
			{ links.map( ( props, index ) => (
				<link { ...props } key={ index } />
			) ) }
		</>,
		document.head
	);
}
