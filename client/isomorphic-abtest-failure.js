import { abtest } from 'calypso/lib/abtest';

export default function ( router ) {
	router( '/abtest-isomorphic-failure', ( { res } ) => {
		abtest( 'letsCrashServers' );
		console.log( 'rendering route on the server' );
		res.write( 'abtest-isomorphic-failure' );
	} );
}
