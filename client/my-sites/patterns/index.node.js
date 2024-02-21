import { makeLayout } from 'calypso/controller';
import { renderPatterns } from 'calypso/my-sites/patterns/controller';

export default function ( router ) {
	router( '/patterns', renderPatterns, makeLayout );
}
