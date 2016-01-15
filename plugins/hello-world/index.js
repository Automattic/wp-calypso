/**
 * External dependencies
 */
import page from 'page';
import controller from './controller';

export default function helloWorld() {
	page( '/hello-world', controller );
}
