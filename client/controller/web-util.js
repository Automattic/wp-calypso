import React from 'react';
import ReactDom from 'react-dom';

// Make React available globally for site-spec library
if ( typeof window !== 'undefined' ) {
	window.React = React;
	window.ReactDOM = ReactDom;
}

export function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
}

export function hydrate( context ) {
	ReactDom.hydrate( context.layout, document.getElementById( 'wpcom' ) );
}
