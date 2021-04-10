/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { determineUrlType } from '@automattic/calypso-url';
import runTests from './common/url-type.skip';

describe( 'determineUrlType', () => {
	runTests( determineUrlType );
} );
