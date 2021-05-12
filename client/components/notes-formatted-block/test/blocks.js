/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Mock dependencies
 */
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

// NOTE: There's a repeating pattern in these tests that links to WordPress.com
//       aren't rendered in the context of Jetpack Cloud. Best I can tell, this
//       is to keep people inside the Jetpack Cloud experience, as opposed to
//       "booting" them back into Calypso.

/**
 * Internal dependencies
 */
import * as Blocks from '../blocks';

expect.extend( {
	toBeTextNodeWithValue( received, val ) {
		const pass = received.type() === undefined && received.debug() === val;

		return pass
			? {
					message: () => `expected not to be a text node with value '${ val }'`,
					pass: true,
			  }
			: {
					message: () => `expected to be a text node with value '${ val }'`,
					pass: false,
			  };
	},
} );

describe( 'Link block', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'on Calypso, relativizes links to WordPress.com', () => {
		isJetpackCloud.mockImplementation( () => false );

		const pathAbsoluteUrl = '/my/test/link?with=params&more=stuff+plus%20junk';
		const text = 'my link text';
		const link = shallow(
			<Blocks.Link
				content={ { url: `https://wordpress.com${ pathAbsoluteUrl }` } }
				children={ text }
			/>
		);

		expect( link.prop( 'href' ) ).toEqual( pathAbsoluteUrl );
		expect( link.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, does not render links to WordPress.com', () => {
		isJetpackCloud.mockImplementation( () => true );

		const text = 'link text';
		const link = shallow(
			<Blocks.Link content={ { url: 'https://wordpress.com/my/test/link' } } children={ text } />
		);

		expect( link ).toBeTextNodeWithValue( text );
	} );

	test.each( [ false, true ] )(
		'when isJetpackCloud() === %s, renders links to non-WordPress sites as-is',
		( val ) => {
			isJetpackCloud.mockImplementation( () => val );

			const arbitraryUrl = 'http://iscalypsofastyet.com/p/buildlog?test1=test1';
			const text = 'my link text';
			const link = shallow( <Blocks.Link content={ { url: arbitraryUrl } } children={ text } /> );

			expect( link.prop( 'href' ) ).toEqual( arbitraryUrl );
			expect( link.text() ).toEqual( text );
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

		const text = 'this is a post';
		const post = shallow( <Blocks.Post content={ content } children={ text } /> );

		expect( post.prop( 'href' ) ).toEqual( `/posts/${ content.siteId }/trash` );
		expect( post.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, if the post is in the trash, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 1,
			isTrashed: true,
		};

		const text = 'this is a post';
		const post = shallow( <Blocks.Post content={ content } children={ text } /> );

		expect( post ).toBeTextNodeWithValue( text );
	} );

	test( 'on Calypso, if the post is not trashed, links to the post itself', () => {
		isJetpackCloud.mockImplementation( () => false );

		const content = {
			siteId: 1,
			postId: 10,
			isTrashed: false,
		};

		const text = 'another post';
		const post = shallow( <Blocks.Post content={ content } children={ text } /> );

		expect( post.prop( 'href' ) ).toEqual(
			`/read/blogs/${ content.siteId }/posts/${ content.postId }`
		);
		expect( post.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, if the post is not trashed, shows emphasized text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 1,
			postId: 10,
			isTrashed: false,
		};

		const text = 'another post';
		const post = shallow( <Blocks.Post content={ content } children={ text } /> );

		expect( post.type() ).toEqual( 'em' );
		expect( post.text() ).toEqual( text );
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
		const comment = shallow( <Blocks.Comment content={ content } children={ text } /> );

		expect( comment.prop( 'href' ) ).toEqual(
			`/read/blogs/${ content.siteId }/posts/${ content.postId }#comment-${ content.commentId }`
		);
		expect( comment.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 'site_id',
			postId: 'post_id',
			commentId: 'comment_id',
		};

		const text = 'what a cool comment';
		const comment = shallow( <Blocks.Comment content={ content } children={ text } /> );

		expect( comment ).toBeTextNodeWithValue( text );
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
		const person = shallow( <Blocks.Person content={ content } children={ text } meta={ {} } /> );

		expect( person.prop( 'href' ) ).toEqual( `/people/edit/${ content.siteId }/${ content.name }` );
		expect( person.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			siteId: 'site_id',
			name: 'Tony Stark',
		};

		const text = 'what a unique and wonderful person';
		const person = shallow( <Blocks.Person content={ content } children={ text } meta={ {} } /> );

		expect( person.type() ).toEqual( 'strong' );
		expect( person.text() ).toEqual( text );
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
		const plugin = shallow( <Blocks.Plugin content={ content } children={ text } meta={ {} } /> );

		expect( plugin.prop( 'href' ) ).toEqual(
			`/plugins/${ content.pluginSlug }/${ content.siteSlug }`
		);
		expect( plugin.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, shows text but does not link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			pluginSlug: 'plugin_slug',
			siteSlug: 'site_slug',
		};

		const text = 'nifty plugin';
		const plugin = shallow( <Blocks.Plugin content={ content } children={ text } meta={ {} } /> );

		expect( plugin ).toBeTextNodeWithValue( text );
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
		const theme = shallow( <Blocks.Theme content={ content } meta={ {} } children={ text } /> );

		expect( theme.prop( 'href' ) ).toEqual( `/theme/${ content.themeSlug }/${ content.siteSlug }` );
		expect( theme.text() ).toEqual( text );
	} );

	test( 'on Jetpack Cloud, if the theme URI is WordPress.com, does not render a link', () => {
		isJetpackCloud.mockImplementation( () => true );

		const content = {
			themeUri: 'https://wordpress.com/noneofthispartmatters',
			themeSlug: 'mythemeslug',
			siteSlug: 'mysiteslug',
		};

		const text = 'oh neato a theme';
		const theme = shallow( <Blocks.Theme content={ content } meta={ {} } children={ text } /> );

		expect( theme ).toBeTextNodeWithValue( text );
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
			const theme = shallow( <Blocks.Theme content={ content } meta={ {} } children={ text } /> );

			expect( theme.prop( 'href' ) ).toEqual( content.themeUri );
			expect( theme.prop( 'target' ) ).toEqual( '_blank' );
			expect( theme.prop( 'rel' ) ).toEqual( 'noopener noreferrer' );
			expect( theme.text() ).toEqual( text );
		}
	);

	test( 'if no theme URI is present, renders text but no link', () => {
		const text = 'oh no, no url';
		const theme = shallow( <Blocks.Theme content={ {} } children={ text } /> );

		expect( theme ).toBeTextNodeWithValue( text );
	} );
} );
