import apiFetch from '@wordpress/api-fetch';
import { type Mock, vi } from 'vitest';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import {
	requestClassificationTags,
	sanitizeClassificationTags,
} from '../src/request-classification-tags';

vi.mock( '@wordpress/api-fetch', () => ( { default: vi.fn() } ) );
vi.mock( 'wpcom-proxy-request', () => ( { default: vi.fn(), canAccessWpcomApis: vi.fn() } ) );

const VALID_TAGS = [ 'cl_category_billing', 'cl_language_pt_BR', 'cl_classified' ];

describe( 'sanitizeClassificationTags', () => {
	it( 'returns a valid list unchanged', () => {
		expect( sanitizeClassificationTags( VALID_TAGS ) ).toEqual( VALID_TAGS );
	} );

	it.each( [
		[ 'no cl_ prefix', 'category_billing' ],
		[ 'a hyphen', 'cl_language_pt-BR' ],
		[ 'a space', 'cl_category billing' ],
		[ 'no name after the prefix', 'cl_' ],
		[ 'a name over 80 characters', `cl_${ 'a'.repeat( 81 ) }` ],
	] )( 'returns no tags when an entry has %s', ( _, badTag ) => {
		expect( sanitizeClassificationTags( [ ...VALID_TAGS, badTag ] ) ).toEqual( [] );
	} );

	it( 'returns no tags when an entry is not a string', () => {
		expect( sanitizeClassificationTags( [ ...VALID_TAGS, 42 ] ) ).toEqual( [] );
	} );

	it( 'returns no tags without cl_classified', () => {
		expect( sanitizeClassificationTags( [ 'cl_category_billing' ] ) ).toEqual( [] );
	} );

	it( 'accepts 30 entries and rejects 31', () => {
		const tags = ( count: number ) => [
			'cl_classified',
			...Array.from( { length: count - 1 }, ( _, i ) => `cl_tag_${ i }` ),
		];

		expect( sanitizeClassificationTags( tags( 30 ) ) ).toHaveLength( 30 );
		expect( sanitizeClassificationTags( tags( 31 ) ) ).toEqual( [] );
	} );

	it( 'returns no tags when the joined list is over 1,000 characters', () => {
		// Each entry is valid on its own: 12 entries of 83 characters, plus cl_classified and
		// 12 commas, make 1,021 characters.
		const longTags = [
			'cl_classified',
			...Array.from( { length: 12 }, ( _, i ) => `cl_${ String( i ).padStart( 80, 'x' ) }` ),
		];

		expect( longTags.join( ',' ) ).toHaveLength( 1021 );
		expect( sanitizeClassificationTags( longTags.slice( 0, -1 ) ) ).toHaveLength( 12 );
		expect( sanitizeClassificationTags( longTags ) ).toEqual( [] );
	} );

	it( 'returns no tags for an empty list', () => {
		expect( sanitizeClassificationTags( [] ) ).toEqual( [] );
	} );

	it.each( [
		[ 'undefined', undefined ],
		[ 'null', null ],
		[ 'a string', 'cl_classified' ],
		[ 'an object', { 0: 'cl_classified' } ],
	] )( 'returns no tags for %s', ( _, value ) => {
		expect( sanitizeClassificationTags( value ) ).toEqual( [] );
	} );
} );

describe( 'requestClassificationTags', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'asks the wpcom endpoint when wpcom APIs are reachable', async () => {
		( canAccessWpcomApis as Mock ).mockReturnValue( true );
		( wpcomRequest as Mock ).mockResolvedValue( { classification_tags: VALID_TAGS } );

		await expect( requestClassificationTags( 123 ) ).resolves.toEqual( VALID_TAGS );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/help/zendesk/update-user-fields',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: { fields: { classify_ai_chat_id: 123 } },
		} );
		expect( apiFetch ).not.toHaveBeenCalled();
	} );

	it( 'asks the Help Center proxy otherwise', async () => {
		( canAccessWpcomApis as Mock ).mockReturnValue( false );
		( apiFetch as unknown as Mock ).mockResolvedValue( { classification_tags: VALID_TAGS } );

		await expect( requestClassificationTags( '123' ) ).resolves.toEqual( VALID_TAGS );

		expect( apiFetch ).toHaveBeenCalledWith( {
			global: true,
			path: '/help-center/zendesk/user-fields',
			method: 'POST',
			data: { fields: { classify_ai_chat_id: '123' } },
		} );
		expect( wpcomRequest ).not.toHaveBeenCalled();
	} );

	it( 'sanitizes the response', async () => {
		( canAccessWpcomApis as Mock ).mockReturnValue( true );
		( wpcomRequest as Mock ).mockResolvedValue( {
			classification_tags: [ 'cl_category_billing' ],
		} );

		await expect( requestClassificationTags( 123 ) ).resolves.toEqual( [] );
	} );

	it( 'resolves to no tags for a server without classification', async () => {
		( canAccessWpcomApis as Mock ).mockReturnValue( true );
		( wpcomRequest as Mock ).mockResolvedValue( { id: 1, user_fields: {} } );

		await expect( requestClassificationTags( 123 ) ).resolves.toEqual( [] );
	} );

	it( 'resolves to no tags when the request fails', async () => {
		( canAccessWpcomApis as Mock ).mockReturnValue( false );
		( apiFetch as unknown as Mock ).mockRejectedValue( new Error( 'timeout' ) );

		await expect( requestClassificationTags( 123 ) ).resolves.toEqual( [] );
	} );
} );
