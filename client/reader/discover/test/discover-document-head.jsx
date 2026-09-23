/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { DiscoverDocumentHead } from '../discover-document-head';

const mockDocumentHead = jest.fn( () => null );
jest.mock( 'calypso/components/data/document-head', () => ( props ) => mockDocumentHead( props ) );

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
