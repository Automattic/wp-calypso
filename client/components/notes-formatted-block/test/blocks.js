/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import * as Blocks from '../blocks';

const EXAMPLE_SITE_ID = 123;

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( func ) => func() ),
	useDispatch: () => jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn().mockImplementation( () => EXAMPLE_SITE_ID ),
} ) );

// NOTE: There's a repeating pattern in these tests that links to WordPress.com
//       aren't rendered in the context of Jetpack Cloud. Best I can tell, this
//       is to keep people inside the Jetpack Cloud experience, as opposed to
//       "booting" them back into Calypso.

// @todo the `meta` prop is only used for the `data-activity` attribute in the
// <a> el for some components, and this aspect is not being tested at the moment.
// It was being tested in `index.js` but was testing if the React prop was passed,
// but it wasn't a very useful test.

describe( 'Link block', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'on Calypso, relativizes links to WordPress.com', () => {
		isJetpackCloud.mockImplementation( () => false );

		const pathAbsoluteUrl = '/my/test/link?with=params&more=stuff+plus%20junk';
		const text = 'my link text';

		render(
			<Blocks.Link
				content={ { url: `https://wordpress.com${ pathAbsoluteUrl }` } }
				children={ text }
			/>
		);

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute( 'href', pathAbsoluteUrl );
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, does not render links to WordPress.com', () => {
		isJetpackCloud.mockImplementation( () => true );

		const text = 'link text';

		render(
			<Blocks.Link content={ { url: 'https://wordpress.com/my/test/link' } } children={ text } />
		);

		const unlinkedText = screen.getByText( text );
		const link = screen.queryByRole( 'link' );

		expect( link ).not.toBeInTheDocument();
		expect( unlinkedText ).toBeVisible();
	} );

	test.each( [ false, true ] )(
		'when isJetpackCloud() === %s, renders links to non-WordPress sites as-is',
		( val ) => {
			isJetpackCloud.mockImplementation( () => val );

			const arbitraryUrl = 'http://iscalypsofastyet.com/p/buildlog?test1=test1';
			const text = 'my link text';
			render( <Blocks.Link content={ { url: arbitraryUrl } } children={ text } /> );

			const link = screen.getByRole( 'link' );

			expect( link ).toHaveAttribute( 'href', arbitraryUrl );
			expect( link ).toHaveTextContent( text );
		}
	);
} );

describe( 'Post block', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'on Calypso, if the post is in the trash, links to the Trash page', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			siteId: 1,
			isTrashed: true,
		};

		const meta = {
			published: null,
		};

		const text = 'this is a post';
		render( <Blocks.Post content={ content } children={ text } meta={ meta } /> );

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute( 'href', `/posts/${ content.siteId }/trash` );
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, if the post is in the trash, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 1,
			isTrashed: true,
		};

		const meta = {
			published: null,
		};

		const text = 'this is a post';
		render( <Blocks.Post content={ content } children={ text } meta={ meta } /> );

		const unlinkedText = screen.getByText( text );
		const link = screen.queryByRole( 'link' );

		expect( link ).not.toBeInTheDocument();
		expect( unlinkedText ).toBeVisible();
	} );

	test( 'on Calypso, if the post is not trashed, links to the post itself', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			siteId: 1,
			postId: 10,
			isTrashed: false,
		};

		const meta = {
			published: null,
		};

		const text = 'another post';
		render( <Blocks.Post content={ content } children={ text } meta={ meta } /> );

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute(
			'href',
			`/reader/blogs/${ content.siteId }/posts/${ content.postId }`
		);
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, if the post is not trashed, shows the text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 1,
			postId: 10,
			isTrashed: false,
		};

		const meta = {
			published: null,
		};

		const text = 'another post';
		const unlinkedPost = render(
			<Blocks.Post content={ content } children={ text } meta={ meta } />
		).container.firstChild;

		expect( unlinkedPost ).toHaveTextContent( text );
	} );
} );

describe( 'Comment block', () => {
	beforeEach( () => jest.resetAllMocks() );
	test( 'on Calypso, links to the comment itself', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			siteId: 'site_id',
			postId: 'post_id',
			commentId: 'comment_id',
		};

		const text = 'what a cool comment';
		render( <Blocks.Comment content={ content } children={ text } /> );

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute(
			'href',
			`/reader/blogs/${ content.siteId }/posts/${ content.postId }#comment-${ content.commentId }`
		);
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 'site_id',
			postId: 'post_id',
			commentId: 'comment_id',
		};

		const text = 'what a cool comment';
		render( <Blocks.Comment content={ content } children={ text } /> );

		const comment = screen.getByText( text );

		expect( comment ).toBeVisible();
	} );
} );

describe( 'Person block', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'on Calypso, links to the corresponding Person page', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			siteId: 'site_id',
			name: 'Tony Stark',
		};

		const text = 'what a unique and wonderful person';
		render( <Blocks.Person content={ content } children={ text } meta={ {} } /> );

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute( 'href', `/people/edit/${ content.siteId }/${ content.name }` );
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 'site_id',
			name: 'Tony Stark',
		};

		const text = 'what a unique and wonderful person';
		const unlinkedPerson = render(
			<Blocks.Person content={ content } children={ text } meta={ {} } />
		).container.firstChild;

		expect( unlinkedPerson.tagName ).toEqual( 'STRONG' );
		expect( unlinkedPerson ).toHaveTextContent( text );
	} );
} );

describe( 'Plugin block', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'on Calypso, links to the corresponding Plugin page', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			pluginSlug: 'plugin_slug',
			siteSlug: 'site_slug',
		};

		const text = 'nifty plugin';
		render( <Blocks.Plugin content={ content } children={ text } meta={ {} } /> );

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute(
			'href',
			`/plugins/${ content.pluginSlug }/${ content.siteSlug }`
		);
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			pluginSlug: 'plugin_slug',
			siteSlug: 'site_slug',
		};

		const text = 'nifty plugin';
		render( <Blocks.Plugin content={ content } children={ text } meta={ {} } /> );

		const unlinkedText = screen.getByText( text );

		expect( unlinkedText ).toBeVisible();
	} );
} );

describe( 'Theme block', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'on Calypso, if the theme URI is WordPress.com, renders the theme link with a relative URL', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			themeUri: 'https://wordpress.com/noneofthispartmatters',
			themeSlug: 'mythemeslug',
			siteSlug: 'mysiteslug',
		};

		const text = 'oh neato a theme';
		render( <Blocks.Theme content={ content } meta={ {} } children={ text } /> );

		const link = screen.getByRole( 'link' );

		expect( link ).toHaveAttribute( 'href', `/theme/${ content.themeSlug }/${ content.siteSlug }` );
		expect( link ).toHaveTextContent( text );
	} );

	test( 'on Jetpack Cloud, if the theme URI is WordPress.com, does not render a link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			themeUri: 'https://wordpress.com/noneofthispartmatters',
			themeSlug: 'mythemeslug',
			siteSlug: 'mysiteslug',
		};

		const text = 'oh neato a theme';
		render( <Blocks.Theme content={ content } meta={ {} } children={ text } /> );

		const unlinkedText = screen.getByText( text );

		expect( unlinkedText ).toBeVisible();
	} );

	test.each( [ false, true ] )(
		'when isJetpackCloud() === %s, if the theme URI is not WordPress.com, renders a new-tab link to the original theme URI',
		( val ) => {
			isJetpackCloud.mockImplementation( () => val );

			const content = {
				themeUri: 'https://mycoolthemesite.example/thebestthemeever',
				themeSlug: 'best-theme-ever',
				siteSlug: 'asleep-newt.jurassic.ninja',
			};

			const text = 'themes are pretty';
			render( <Blocks.Theme content={ content } meta={ {} } children={ text } /> );

			const link = screen.getByRole( 'link' );

			expect( link ).toHaveAttribute( 'href', content.themeUri );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
			expect( link ).toHaveTextContent( text );
		}
	);

	test( 'if no theme URI is present, renders text but no link', () => {
		const text = 'oh no, no url';
		render( <Blocks.Theme content={ {} } children={ text } /> );

		const unlinkedText = screen.getByText( text );

		expect( unlinkedText ).toBeVisible();
	} );
} );
