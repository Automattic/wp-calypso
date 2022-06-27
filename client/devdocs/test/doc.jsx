/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import DocService from 'calypso/devdocs/service';
import SingleDocClass from '../doc';

jest.mock( 'calypso/devdocs/service', () => ( {
	fetch: jest.fn(),
} ) );

const defaultProps = {
	term: 'hello',
	path: '/example',
	sectionId: '',
};

describe( 'SingleDoc', () => {
	describe( 'render test', () => {
		test( 'should render html with marked text', () => {
			const text = 'something hello';
			DocService.fetch.mockImplementationOnce( ( path, cb ) =>
				cb( null, `<div><p>${ text }</p></div>` )
			);

			render( <SingleDocClass { ...defaultProps } /> );

			const mark = screen.getByText( 'hello' );
			expect( mark.tagName ).toBe( 'MARK' );

			const doc = screen.getByText( 'something' );
			expect( doc.textContent ).toEqual( text );
		} );

		test( 'should render Error component', () => {
			DocService.fetch.mockImplementationOnce( ( path, cb ) =>
				cb( 'Error invoking /devdocs/content: File does not exist" is displayed' )
			);
			render( <SingleDocClass { ...defaultProps } /> );

			const error = screen.queryByText( /sorry, we can't find that page right now/i );
			expect( error ).toBeInTheDocument();
		} );
	} );
} );
