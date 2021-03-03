/**
 * External dependencies
 */
import { FunctionComponent, useEffect } from 'react';
import { record } from 'rrweb';

const SessionRecorder: FunctionComponent = () => {
	useEffect( () => {
		// const changes: string[] = [];
		const stopFn = record( {
			emit: ( event ) => {
				// changes.push( JSON.stringify( event ) );
				console.log( event );
			},
		} );
		return () => {
			stopFn ? stopFn() : undefined;
			// console.log( changes.toString() );
		};
	} );

	return null;
};

export default SessionRecorder;
