/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import isA8CForAgencies from '../../../../lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from '../../../../lib/jetpack/is-jetpack-cloud';
import { ActivityEvent } from '../activity-event';
import type { SiteActivityLog } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => jest.fn( () => '' ) );
jest.mock( '../../../../lib/jetpack/is-jetpack-cloud', () => jest.fn( () => false ) );
jest.mock( '../../../../lib/a8c-for-agencies/is-a8c-for-agencies', () => jest.fn( () => false ) );

const mockedIsJetpackCloud = isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud >;
const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;

describe( 'ActivityEvent', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	it( 'renders the summary and plain content text', () => {
		render( <ActivityEvent summary="Summary" content={ { text: 'Plain content' } } /> );

		expect( screen.getByText( 'Summary' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plain content' ) ).toBeInTheDocument();
	} );

	it( 'renders formatted content with links', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'View post',
			ranges: [
				{
					id: 'range-1',
					indices: [ 0, 4 ],
					type: 'link',
					url: 'https://wordpress.com/post/example',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'View' } );
		expect( link ).toBeInTheDocument();
		expect( link.getAttribute( 'href' ) ).toBe( '/post/example' );
	} );

	it( 'renders strong ranges as bold text', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'A Bold move',
			ranges: [
				{
					id: 'strong',
					indices: [ 2, 6 ],
					type: 'strong',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const strong = screen.getByText( 'Bold' );
		expect( strong.tagName ).toBe( 'STRONG' );
	} );

	it( 'renders emphasis ranges inside <em>', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'Very important',
			ranges: [
				{
					id: 'em',
					indices: [ 5, 14 ],
					type: 'em',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const emphasis = screen.getByText( 'important' );
		expect( emphasis.tagName ).toBe( 'EM' );
	} );

	it( 'renders preformatted ranges inside <pre>', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'Code block',
			ranges: [
				{
					id: 'pre',
					indices: [ 0, 4 ],
					type: 'pre',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const pre = screen.getByText( 'Code' );
		expect( pre.tagName ).toBe( 'PRE' );
	} );

	it( 'renders file paths inside a <code> element', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'File wp-config.php',
			ranges: [
				{
					id: 'filepath',
					indices: [ 5, 18 ],
					type: 'filepath',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const code = screen.getByText( 'wp-config.php' );
		expect( code.tagName ).toBe( 'CODE' );
	} );

	it( 'renders post links when post ranges are provided', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'View Example now',
			ranges: [
				{
					id: 77,
					indices: [ 5, 12 ],
					type: 'post',
					site_id: 123,
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'Example' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/reader/blogs/123/posts/77' );
	} );

	it( 'renders comment links with anchors', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'Comment added',
			ranges: [
				{
					url: 'https://wordpress.com/comment/2/1',
					indices: [ 0, 7 ],
					id: 1,
					parent: null,
					type: 'a',
					site_id: 2,
					section: 'comment',
					intent: 'edit',
					context: 'single',
					root_id: 3,
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'Comment' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/comment/2/1' );
	} );

	it( 'renders plugin links for plugin ranges', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'Activated Akismet today',
			ranges: [
				{
					id: 123,
					indices: [ 10, 17 ],
					type: 'plugin',
					slug: 'akismet',
					site_slug: 'example.com',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'Akismet' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/plugins/akismet/example.com' );
	} );

	it( 'renders theme links when themes originate from WordPress.com', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'Installed Example today',
			ranges: [
				{
					id: 123,
					indices: [ 10, 17 ],
					type: 'theme',
					slug: 'example',
					site_slug: 'example.com',
					uri: 'https://wordpress.com/theme/example',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'Example' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/theme/example/example.com' );
	} );

	it( 'renders external theme links with target and rel attributes', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'External theme installed',
			ranges: [
				{
					id: 123,
					indices: [ 0, 14 ],
					type: 'theme',
					slug: 'external-theme',
					site_slug: 'site-slug',
					uri: 'https://example.com/theme',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'External theme' } );
		expect( link.getAttribute( 'href' ) ).toBe( 'https://example.com/theme' );
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
	} );

	it( 'renders backup links with site slug fallback', () => {
		const content: SiteActivityLog[ 'content' ] = {
			text: 'Restored backup now',
			ranges: [
				{
					id: 123,
					indices: [ 9, 15 ],
					type: 'backup',
					site_slug: 'site-slug',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'backup' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/backup/site-slug' );
	} );
} );
