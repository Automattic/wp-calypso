/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import WPCheckout from '../src/wp-checkout';

function Catalog( { className } ) {
	return (
		<div className={ className }>
			<h1>Stand-alone Component Catalog</h1>
			<WPCheckout />
		</div>
	);
}

ReactDOM.render( <Catalog />, document.getElementById( 'root' ) );
