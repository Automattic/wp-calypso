/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { DiscoverDocumentHead } from '../discover-document-head';

const mockDocumentHead = vi.fn( () => null );
vi.mock( 'calypso/components/data/document-head', () => ( {
	default: ( props ) => mockDocumentHead( props ),
} ) );

const getMeta = () => mockDocumentHead.mock.calls[ 0 ][ 0 ].meta;

describe( 'DiscoverDocumentHead', () => {
	beforeEach( () => mockDocumentHead.mockClear() );

	test( 'does not emit a robots meta by default', () => {
		render( <DiscoverDocumentHead /> );
		expect( getMeta() ).not.toContainEqual( expect.objectContaining( { name: 'robots' } ) );
	} );

	test( 'emits a noindex robots meta when noindex is set', () => {
		render( <DiscoverDocumentHead noindex /> );
		expect( getMeta() ).toContainEqual( { name: 'robots', content: 'noindex' } );
	} );
} );
