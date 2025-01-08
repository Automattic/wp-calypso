/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import ReaderAuthorLink, { ReaderLinkAuthor } from '../index';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: () => {},
	recordGaEvent: () => {},
	recordTrackForPost: () => {},
} ) );

describe( 'ReaderAuthorLink', () => {
	let author: ReaderLinkAuthor;

	beforeEach( () => {
		author = { URL: 'http://wpcalypso.wordpress.com', name: 'Barnaby Blogwit' };
	} );

	test( 'should render children', () => {
		const { container } = render(
			<ReaderAuthorLink author={ author }>Barnaby Blogwit</ReaderAuthorLink>
		);
		expect( container ).toHaveTextContent( 'Barnaby Blogwit' );
	} );

	test( 'should accept a custom class of `test__ace`', () => {
		const { container } = render(
			<ReaderAuthorLink author={ author } className="test__ace">
				xyz
			</ReaderAuthorLink>
		);
		expect( container.firstChild ).toHaveClass( 'test__ace' );
	} );

	test( 'should return null with a undefined author name', () => {
		author.name = undefined;
		const { container } = render( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should return null with a blocked author name', () => {
		author.name = 'admin';
		const { container } = render( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should use siteUrl if provided', () => {
		const siteUrl = 'http://discover.wordpress.com';
		render(
			<ReaderAuthorLink author={ author } siteUrl={ siteUrl }>
				xyz
			</ReaderAuthorLink>
		);
		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', siteUrl );
	} );

	test( 'should use author.URL if site URL is not provided', () => {
		render( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', author.URL );
	} );

	test( 'should not return a link if siteUrl and author.URL are both missing', () => {
		author.URL = undefined;
		const { container } = render( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		// Should just return children
		expect( container.firstChild?.nodeName ).toEqual( 'SPAN' );
	} );
} );
