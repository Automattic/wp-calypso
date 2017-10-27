/**
 * Internal dependencies
 */
import { siteSelection, navigation } from 'themes/controller';
import { helloWorld } from './controller';

export default function( router ) {
	router( '/hello-world/:domain?', siteSelection, navigation, helloWorld );
}
