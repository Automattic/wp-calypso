/**
 * External dependencies
 */
import { EventEmitter } from 'events';

export default function ( prototype ) {
	Object.assign( prototype, EventEmitter.prototype );
	prototype.emitChange = function () {
		this.emit( 'change' );
	};
	prototype.off = prototype.removeListener;
}
