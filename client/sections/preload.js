import emitter from 'lib/mixins/emitter';

export const hub = {};
emitter( hub );

export function preload( section ) {
	hub.emit( 'preload', section );
}
