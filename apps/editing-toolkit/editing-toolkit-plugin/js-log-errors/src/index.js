/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/*
interface ErrLog {
	push( ...args: any[] ): void;
	length: number;
	shift(): any;
}

declare global {
	interface Window {
		_fse_errlog?: ErrLog;
	}
}
*/

function handle_error( ...args ) {
	console.log( 'Received: %o', args );
}

function init() {
	window._fse_errlog = window._fse_errlog || [];
	while ( window._fse_errlog.length > 0 ) {
		handle_error( window._fse_errlog.shift() );
	}
	window._fse_errlog = {
		push: handle_error,
	};
}
init();
