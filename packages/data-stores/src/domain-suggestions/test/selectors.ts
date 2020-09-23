/**
 * External dependencies
 */
import { select, subscribe } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { register } from '..';
import { DataStatus } from '../constants';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
} ) );

let store: ReturnType< typeof register >;

const options = {
	category_slug: undefined,
	include_dotblogsubdomain: false,
	include_wordpressdotcom: true,
	locale: 'en',
	quantity: 11,
};
const apiResponse = [
	{
		domain_name: 'test.site',
		relevance: 1,
		supports_privacy: true,
		vendor: 'donuts',
		match_reasons: [ 'tld-common', 'tld-exact' ],
		product_id: 78,
		product_slug: 'dotsite_domain',
		cost: '$25.00',
	},
	{
		domain_name: 'hot-test-site.com',
		relevance: 1,
		supports_privacy: true,
		vendor: 'donuts',
		match_reasons: [ 'tld-common' ],
		product_id: 6,
		product_slug: 'domain_reg',
		cost: '$18.00',
	},
];

beforeAll( () => {
	store = register( { vendor: 'variation2_front' } );
} );

beforeEach( () => {
	( wpcomRequest as jest.Mock ).mockReset();
} );

describe( 'getDomainSuggestions', () => {
	it( 'resolves the state via an API call and caches the resolver on success', async () => {
		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		const query = 'test query one';
		const listenForStateUpdate = () => {
			return new Promise( ( resolve ) => {
				const unsubscribe = subscribe( () => {
					unsubscribe();
					resolve();
				} );
			} );
		};

		// Status should be uninitialized before first call
		expect( select( store ).getDomainState() ).toEqual( DataStatus.Uninitialized );

		// First call returns undefined
		expect( select( store ).getDomainSuggestions( query, options ) ).toEqual( undefined );

		// Status should be pending while we wait for the response
		expect( select( store ).getDomainState() ).toEqual( DataStatus.Pending );

		await listenForStateUpdate();

		// Status should be successful once we get the response
		expect( select( store ).getDomainState() ).toEqual( DataStatus.Success );

		// By the second call, the resolver will have resolved
		expect( select( store ).getDomainSuggestions( query, options ) ).toEqual( apiResponse );

		await listenForStateUpdate();

		// The resolver should now be cached with an `isStarting` value of false

		expect(
			select( 'core/data' ).isResolving( store, 'getDomainSuggestions', [ query, options ] )
		).toStrictEqual( false );
	} );
} );

describe( 'getDomainErrorMessage', () => {
	it( 'should return null if no error message', () => {
		expect( select( store ).getDomainErrorMessage() ).toEqual( null );
	} );

	it( 'should return correct error message if no suggestions are returned', async () => {
		( wpcomRequest as jest.Mock ).mockResolvedValue( null );

		const query = 'test query two';
		const listenForStateUpdate = () => {
			return new Promise( ( resolve ) => {
				const unsubscribe = subscribe( () => {
					unsubscribe();
					resolve();
				} );
			} );
		};

		// The error message should start off as a null value
		expect( select( store ).getDomainErrorMessage() ).toBeFalsy();

		// First call returns undefined
		select( store ).getDomainSuggestions( query, options );
		await listenForStateUpdate();

		// By the second call, the resolver will have resolved
		select( store ).getDomainSuggestions( query, options );
		await listenForStateUpdate();

		// The promise resolves null suggestions so we should now have an error message
		expect( select( store ).getDomainErrorMessage() ).toBeTruthy();
	} );
} );
