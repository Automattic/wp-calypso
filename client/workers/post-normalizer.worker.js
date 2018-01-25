/** @format */

import * as parse5 from 'parse5';

// Respond to message from parent thread
self.addEventListener( 'message', event => {
	console.log( event );
	self.postMessage( { done: 'yup' } );
} );
