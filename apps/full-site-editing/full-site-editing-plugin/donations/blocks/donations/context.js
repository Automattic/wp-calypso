/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { createContext } from '@wordpress/element';

const Context = createContext( {
	activeTab: 'one-time',
} );

export default Context;
