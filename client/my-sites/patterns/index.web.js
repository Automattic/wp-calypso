import { makeLayout } from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { fetchPatterns, renderPatterns } from './controller';

export default function ( router ) {
	router( '/patterns', setLocaleMiddleware(), fetchPatterns, renderPatterns, makeLayout );
}
