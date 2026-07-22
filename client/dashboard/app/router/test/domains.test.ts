/**
 * @jest-environment jsdom
 */

import { logToLogstash } from 'calypso/lib/logstash';
import { domainRoute } from '../domains';

jest.mock( '@automattic/calypso-config', () => jest.fn( () => 'development' ) );
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const mockedLogToLogstash = jest.mocked( logToLogstash );

beforeEach( () => {
	jest.clearAllMocks();
	Object.defineProperty( document, 'referrer', {
		value: 'https://external.example.com/',
		configurable: true,
	} );
} );

describe( 'domainRoute beforeLoad', () => {
	const beforeLoad = domainRoute.options.beforeLoad as (
		ctx: { params: { domainName: string } }
	) => void;

	test( 'throws for the literal string "undefined"', () => {
		expect( () => beforeLoad( { params: { domainName: 'undefined' } } ) ).toThrow();
	} );

	test( 'throws for an empty string', () => {
		expect( () => beforeLoad( { params: { domainName: '' } } ) ).toThrow();
	} );

	test( 'throws for a slug with no period', () => {
		expect( () => beforeLoad( { params: { domainName: 'nodot' } } ) ).toThrow();
	} );

	test( 'logs the invalid slug and HTTP referrer when slug is invalid', () => {
		try {
			beforeLoad( { params: { domainName: 'undefined' } } );
		} catch {
			// expected throw
		}

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedLogToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				message: 'Invalid domain slug in route param',
				properties: expect.objectContaining( {
					invalid_slug: 'undefined',
					referrer: 'https://external.example.com/',
				} ),
			} )
		);
	} );

	test( 'does not throw for a valid domain name', () => {
		expect( () => beforeLoad( { params: { domainName: 'example.com' } } ) ).not.toThrow();
		expect( mockedLogToLogstash ).not.toHaveBeenCalled();
	} );

	test( 'does not throw for a subdomain', () => {
		expect( () =>
			beforeLoad( { params: { domainName: 'sub.example.com' } } )
		).not.toThrow();
	} );
} );
