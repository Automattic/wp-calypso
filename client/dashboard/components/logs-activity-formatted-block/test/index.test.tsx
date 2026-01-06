/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderFormattedContent, createFormattedBlock } from '../';
import isA8CForAgencies from '../../../../lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from '../../../../lib/jetpack/is-jetpack-cloud';
import { isDashboardBackport } from '../../../utils/is-dashboard-backport';
import type { ActivityBlockContent, ActivityBlockMeta } from '../types';

jest.mock( '../../../../lib/jetpack/is-jetpack-cloud', () => jest.fn() );
jest.mock( '../../../../lib/a8c-for-agencies/is-a8c-for-agencies', () => jest.fn() );
jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn(),
} ) );

const mockedIsJetpackCloud = isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud >;
const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;
const mockedIsDashboardBackport = isDashboardBackport as jest.MockedFunction<
	typeof isDashboardBackport
>;

const renderFormatted = (
	items: ActivityBlockContent | ActivityBlockContent[],
	{
		onClick = () => null,
		meta = {},
	}: { onClick?: ( event: unknown ) => void | null; meta?: ActivityBlockMeta } = {}
) => {
	const arrayItems = Array.isArray( items ) ? items : [ items ];
	return render(
		<div data-testid="formatted-content">
			{ renderFormattedContent( {
				items: arrayItems,
				onClick,
				meta,
			} ) }
		</div>
	);
};

describe( 'FormattedBlock renderer', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test( 'renders string content as-is', () => {
		renderFormatted( 'plain text' );

		expect( screen.getByText( 'plain text' ) ).toBeInTheDocument();
	} );

	test( 'renders nested children when block type is undefined', () => {
		const { getByTestId } = renderFormatted( {
			children: [ 'example1', { text: 'main' }, { children: [ 'child1', 'child2' ] } ],
		} );

		const wrapper = getByTestId( 'formatted-content' );
		expect( wrapper.textContent ).toContain( 'example1' );
		expect( wrapper.textContent ).toContain( 'main' );
		expect( wrapper.textContent ).toContain( 'child1' );
		expect( wrapper.textContent ).toContain( 'child2' );
	} );

	test( 'passes onClick handlers to block elements', async () => {
		const user = userEvent.setup();
		const handleClick = jest.fn( ( event: unknown ) => {
			if (
				event &&
				typeof ( event as { preventDefault?: () => void } ).preventDefault === 'function'
			) {
				( event as { preventDefault?: () => void } ).preventDefault?.();
			}
		} );

		renderFormatted(
			{
				type: 'link',
				url: 'https://wordpress.com/example',
				children: [ 'Click me' ],
			},
			{ onClick: handleClick }
		);

		await user.click( screen.getByRole( 'link' ) );

		expect( handleClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders supported block types with appropriate elements', () => {
		renderFormatted( { type: 'b', children: [ 'bold text' ] } );

		const strong = screen.getByText( 'bold text' );
		expect( strong.tagName ).toBe( 'STRONG' );
	} );
} );

describe( 'Link blocks', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test.each( [
		[ 'Jetpack Cloud', true, false ],
		[ 'A4A', false, true ],
	] )( 'does not render wordpress.com links inside %s', ( _, isJetpack, isA4A ) => {
		mockedIsJetpackCloud.mockReturnValue( isJetpack );
		mockedIsA8CForAgencies.mockReturnValue( isA4A );

		renderFormatted( {
			type: 'link',
			url: 'https://wordpress.com/path',
			children: [ 'WordPress link' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'WordPress link' ) ).toBeInTheDocument();
	} );

	test.each( [ false, true ] )(
		'renders external links unchanged when isJetpackCloud() === %s',
		( isJetpack ) => {
			mockedIsJetpackCloud.mockReturnValue( isJetpack );
			mockedIsA8CForAgencies.mockReturnValue( false );

			renderFormatted( {
				type: 'link',
				url: 'https://example.com/path',
				children: [ 'External' ],
			} );

			const link = screen.getByRole( 'link' );
			expect( link ).toHaveAttribute( 'href', 'https://example.com/path' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'external noreferrer noopener' );
		}
	);
} );

describe( 'Post blocks', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test( 'links to the trash page when post is trashed', () => {
		renderFormatted( {
			type: 'post',
			siteId: 1,
			postId: 10,
			isTrashed: true,
			children: [ 'Trashed post' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/posts/1/trash' );
		expect( link ).toHaveTextContent( 'Trashed post' );
	} );

	test( 'links to the reader post when not trashed', () => {
		renderFormatted( {
			type: 'post',
			siteId: 1,
			postId: 10,
			isTrashed: false,
			children: [ 'Published post' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/reader/blogs/1/posts/10' );
	} );

	test.each( [
		[ 'Jetpack Cloud', true, false ],
		[ 'A4A', false, true ],
	] )( 'renders plain text inside %s', ( _, isJetpack, isA4A ) => {
		mockedIsJetpackCloud.mockReturnValue( isJetpack );
		mockedIsA8CForAgencies.mockReturnValue( isA4A );

		renderFormatted( {
			type: 'post',
			siteId: 1,
			postId: 10,
			children: [ 'Plain post' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Plain post' ) ).toBeInTheDocument();
	} );
} );

describe( 'Comment blocks', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test( 'links to the comment anchor on Calypso', () => {
		renderFormatted( {
			type: 'comment',
			siteId: 'site',
			postId: 'post',
			commentId: 'comment',
			children: [ 'A comment' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/reader/blogs/site/posts/post#comment-comment' );
	} );

	test.each( [
		[ 'Jetpack Cloud', true, false ],
		[ 'A4A', false, true ],
	] )( 'renders plain text inside %s', ( _, isJetpack, isA4A ) => {
		mockedIsJetpackCloud.mockReturnValue( isJetpack );
		mockedIsA8CForAgencies.mockReturnValue( isA4A );

		renderFormatted( {
			type: 'comment',
			siteId: 'site',
			postId: 'post',
			commentId: 'comment',
			children: [ 'A comment' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'A comment' ) ).toBeInTheDocument();
	} );
} );

describe( 'Person blocks', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test( 'links to the people editor on Calypso', () => {
		renderFormatted( {
			type: 'person',
			siteId: 'site_id',
			name: 'tony',
			children: [ 'Tony Stark' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/people/edit/site_id/tony' );
		expect( link.querySelector( 'strong' ) ).toHaveTextContent( 'Tony Stark' );
	} );

	test.each( [
		[ 'Jetpack Cloud', true, false ],
		[ 'A4A', false, true ],
	] )( 'renders bold text without link inside %s', ( _, isJetpack, isA4A ) => {
		mockedIsJetpackCloud.mockReturnValue( isJetpack );
		mockedIsA8CForAgencies.mockReturnValue( isA4A );

		renderFormatted( {
			type: 'person',
			siteId: 'site_id',
			name: 'tony',
			children: [ 'Tony Stark' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		const strong = screen.getByText( 'Tony Stark' );
		expect( strong.tagName ).toBe( 'STRONG' );
	} );
} );

describe( 'Plugin blocks', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		mockedIsDashboardBackport.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test( 'renders an external link when not in the backport', () => {
		renderFormatted( {
			type: 'plugin',
			pluginSlug: 'plugin-slug',
			siteSlug: 'site-slug',
			children: [ 'A plugin' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link.getAttribute( 'href' ) ).toMatch( /\/plugins\/plugin-slug\/site-slug$/ );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'external noreferrer noopener' );
	} );

	test( 'renders a regular link when in the backport', () => {
		mockedIsDashboardBackport.mockReturnValue( true );

		renderFormatted( {
			type: 'plugin',
			pluginSlug: 'plugin-slug',
			siteSlug: 'site-slug',
			children: [ 'A plugin' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link.getAttribute( 'href' ) ).toMatch( /\/plugins\/plugin-slug\/site-slug$/ );
		expect( link ).not.toHaveAttribute( 'target' );
		expect( link ).not.toHaveAttribute( 'rel' );
	} );

	test( 'renders plain text when siteSlug is missing', () => {
		renderFormatted( {
			type: 'plugin',
			pluginSlug: 'plugin-slug',
			children: [ 'A plugin' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'A plugin' ) ).toBeInTheDocument();
	} );

	test.each( [
		[ 'Jetpack Cloud', true, false ],
		[ 'A4A', false, true ],
	] )( 'renders plain text inside %s', ( _, isJetpack, isA4A ) => {
		mockedIsJetpackCloud.mockReturnValue( isJetpack );
		mockedIsA8CForAgencies.mockReturnValue( isA4A );

		renderFormatted( {
			type: 'plugin',
			pluginSlug: 'plugin-slug',
			siteSlug: 'site-slug',
			children: [ 'A plugin' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'A plugin' ) ).toBeInTheDocument();
	} );
} );

describe( 'Theme blocks', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	test( 'renders relative link for wordpress.com themes', () => {
		renderFormatted( {
			type: 'theme',
			themeUri: 'https://wordpress.com/themes/example',
			themeSlug: 'example',
			siteSlug: 'site-slug',
			children: [ 'Theme name' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/theme/example/site-slug' );
	} );

	test.each( [
		[ 'Jetpack Cloud', true, false ],
		[ 'A4A', false, true ],
	] )( 'renders plain text for wordpress.com themes inside %s', ( _, isJetpack, isA4A ) => {
		mockedIsJetpackCloud.mockReturnValue( isJetpack );
		mockedIsA8CForAgencies.mockReturnValue( isA4A );

		renderFormatted( {
			type: 'theme',
			themeUri: 'https://wordpress.com/themes/example',
			themeSlug: 'example',
			siteSlug: 'site-slug',
			children: [ 'Theme name' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Theme name' ) ).toBeInTheDocument();
	} );

	test( 'renders external themes with target and rel attributes', () => {
		renderFormatted( {
			type: 'theme',
			themeUri: 'https://example.com/theme',
			themeSlug: 'example',
			siteSlug: 'site-slug',
			children: [ 'External theme' ],
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', 'https://example.com/theme' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
	} );

	test( 'renders text when themeUri is missing', () => {
		renderFormatted( {
			type: 'theme',
			children: [ 'No link theme' ],
		} );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'No link theme' ) ).toBeInTheDocument();
	} );
} );

// These are previous tests that were part of the notes-formatted-block test suite
describe( 'createFormattedBlock', () => {
	test( 'renders string content without using a custom block if content type is undefined', () => {
		const MockBlockMapping = createFormattedBlock( {
			//@ts-ignore backport of previous testing suite, not typed. Added for backward compatibility
			myBlock: ( props ) => <div { ...props }>MyFakeBlock</div>,
		} );

		const children = [
			'example1',
			{
				text: 'main',
			},
			{
				children: [ 'children1', 'children2' ],
			},
		];

		render( <MockBlockMapping content={ { children } } meta={ {} } onClick={ jest.fn() } /> );

		const customBlock = screen.queryByText( 'MyFakeBlock' );
		const block = screen.getByText( /example1/ );

		expect( customBlock ).not.toBeInTheDocument();

		expect( block ).toBeInTheDocument();
		expect( block ).toHaveTextContent( 'main' );
		expect( block ).toHaveTextContent( 'children1' );
		expect( block ).toHaveTextContent( 'children2' );
	} );

	test( 'handles a click if `onClick` prop is passed', async () => {
		userEvent.setup();

		const MockBlockMapping = createFormattedBlock( {
			//@ts-ignore backport of previous testing suite, not typed. Added for backward compatibility
			myBlock: ( props ) => <div { ...props }>MyFakeBlock</div>,
		} );

		const content = { type: 'myBlock', children: [ 'children1', 'children2' ] };

		const onClick = jest.fn();

		render( <MockBlockMapping content={ content } onClick={ onClick } meta={ {} } /> );

		await userEvent.click( screen.getByText( /MyFakeBlock/ ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders the correct block if the content type is supported', () => {
		const MockBlockMapping = createFormattedBlock( {
			myBlock: ( props ) => (
				//@ts-ignore backport of previous testing suite, not typed. Added for backward compatibility
				<div { ...props }>
					MyFakeBlock
					{ props.children }
				</div>
			),
		} );

		const content = { type: 'myBlock', children: [ 'children1', 'children2' ] };

		render( <MockBlockMapping content={ content } meta={ {} } onClick={ jest.fn() } /> );

		const block = screen.getByText( /MyFakeBlock/ );

		expect( block ).toBeInTheDocument();
		expect( block ).toHaveTextContent( 'children1' );
		expect( block ).toHaveTextContent( 'children2' );
	} );
} );
