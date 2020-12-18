import { abtest } from 'calypso/lib/abtest';

export default function ( router ) {
	router( '/abtest-isomorphic-failure', ( context ) => {
		abtest( 'lets-crash-servers' );
	} );
}
