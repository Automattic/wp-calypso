import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { fetchPatterns, renderPatterns } from './controller';

export default function ( router ) {
	router( '/patterns', ssrSetupLocale, fetchPatterns, renderPatterns, makeLayout );
}
