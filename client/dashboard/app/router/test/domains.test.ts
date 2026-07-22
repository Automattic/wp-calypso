/**
 * @jest-environment jsdom
 */

import { logToLogstash } from 'calypso/lib/logstash';
import { domainRoute } from '../domains';

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const mockLogToLogstash = jest.mocked( logToLogstash );

beforeEach( () => {
	jest.clearAllMocks();
} );

type BeforeLoadContext = { params: { domainName: string } };

function callBeforeLoad( domainName: string ) {
	const beforeLoad = domainRoute.options.beforeLoad as (
		ctx: BeforeLoadContext
	) => void | undefined;
	return beforeLoad( { params: { domainName } } );
}

describe( 'domainRoute beforeLoad', () => {
	test( 'throws when domainName param is the string "undefined"', () => {
		expect( () => callBeforeLoad( 'undefined' ) ).toThrow();
	} );

	test( 'throws when domainName param is an empty string', () => {
		expect( () => callBeforeLoad( '' ) ).toThrow();
	} );

	test( 'logs to logstash with domain and referrer when domainName is invalid', () => {
		expect( () => callBeforeLoad( 'undefined' ) ).toThrow();
		expect( mockLogToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feature: 'calypso_client',
				properties: expect.objectContaining( {
					domain: 'undefined',
					referrer: expect.any( String ),
				} ),
			} )
		);
	} );

	test( 'does not throw for a valid domain name', () => {
		expect( () => callBeforeLoad( 'example.com' ) ).not.toThrow();
		expect( mockLogToLogstash ).not.toHaveBeenCalled();
	} );

	test( 'does not throw for a valid subdomain', () => {
		expect( () => callBeforeLoad( 'mysite.wordpress.com' ) ).not.toThrow();
	} );
} );
