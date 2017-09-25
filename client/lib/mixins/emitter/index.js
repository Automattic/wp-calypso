/**
 * External dependencies
 */
import { EventEmitter } from 'events/';
import { assign } from 'lodash';

export default function( prototype ) {
	assign( prototype, EventEmitter.prototype );
	prototype.emitChange = function() {
		this.emit( 'change' );
	};
	prototype.off = prototype.removeListener;
}
