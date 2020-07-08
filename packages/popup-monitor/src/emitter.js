/**
 * External dependencies
 */
import { assign } from 'lodash';
import { EventEmitter } from 'events';

export default function ( prototype ) {
	assign( prototype, EventEmitter.prototype );
	prototype.emitChange = function () {
		this.emit( 'change' );
	};
	prototype.off = prototype.removeListener;
}
