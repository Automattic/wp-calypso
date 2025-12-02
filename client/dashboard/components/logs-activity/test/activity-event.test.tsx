/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import isA8CForAgencies from '../../../../lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from '../../../../lib/jetpack/is-jetpack-cloud';
import { ActivityEvent } from '../activity-event';
import type { Activity, ActivityDescription } from '../types';

jest.mock( '@automattic/calypso-config', () => jest.fn( () => '' ) );
jest.mock( '../../../../lib/jetpack/is-jetpack-cloud', () => jest.fn( () => false ) );
jest.mock( '../../../../lib/a8c-for-agencies/is-a8c-for-agencies', () => jest.fn( () => false ) );

const mockedIsJetpackCloud = isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud >;
const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;

const createActivity = ( {
	title = 'Summary',
	icon,
	activityDescription,
}: {
	title?: string;
	icon?: string;
	activityDescription?: ActivityDescription;
} = {} ): Activity => {
	const description: ActivityDescription = activityDescription ?? {
		textDescription: '',
		items: [],
	};

	return {
		activityDescription: description,
		activityIcon: icon,
		activityId: 'test.' + Math.random().toString(),
		activityMedia: {
			available: false,
			medium_url: '',
			name: '',
			thumbnail_url: '',
			type: '',
			url: '',
		},
		activityName: 'activity',
		activityStatus: '',
		activityTitle: title,
		activityTs: 0,
		activityUnparsedTs: '',
		activityActor: {},
		activityIsRewindable: false,
	};
};

describe( 'ActivityEvent', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedIsA8CForAgencies.mockReturnValue( false );
		jest.clearAllMocks();
	} );

	it( 'renders the summary and plain content text', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Plain content',
			items: [ 'Plain content' ],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		expect( screen.getByText( 'Summary' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plain content' ) ).toBeInTheDocument();
	} );

	it( 'renders formatted content with links', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'View post',
			items: [
				{
					type: 'link',
					url: 'https://wordpress.com/post/example',
					children: [ 'View' ],
				},
				'post',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'View' } );
		expect( link ).toBeInTheDocument();
		expect( link.getAttribute( 'href' ) ).toBe( '/post/example' );
	} );

	it( 'renders strong ranges as bold text', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'A Bold move',
			items: [
				'A ',
				{
					type: 'strong',
					children: [ 'Bold' ],
					text: 'Bold',
				},
				' move',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const strong = screen.getByText( 'Bold' );
		expect( strong.tagName ).toBe( 'STRONG' );
	} );

	it( 'renders emphasis ranges inside <em>', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Very important',
			items: [
				'Very ',
				{
					type: 'em',
					children: [ 'important' ],
					text: 'important',
				},
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const emphasis = screen.getByText( 'important' );
		expect( emphasis.tagName ).toBe( 'EM' );
	} );

	it( 'renders preformatted ranges inside <pre>', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Code block',
			items: [
				{
					type: 'pre',
					children: [ 'Code' ],
					text: 'Code',
				},
				' block',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const pre = screen.getByText( 'Code' );
		expect( pre.tagName ).toBe( 'PRE' );
	} );

	it( 'renders file paths inside a <code> element', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'File wp-config.php',
			items: [
				'File ',
				{
					type: 'filepath',
					children: [ 'wp-config.php' ],
					text: 'wp-config.php',
				},
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const code = screen.getByText( 'wp-config.php' );
		expect( code.tagName ).toBe( 'CODE' );
	} );

	it( 'renders post links when post ranges are provided', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'View Example now',
			items: [
				'View ',
				{
					type: 'post',
					siteId: 123,
					postId: 77,
					children: [ 'Example' ],
					text: 'Example',
				},
				' now',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Example' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/reader/blogs/123/posts/77' );
	} );

	it( 'renders comment links with anchors', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Comment added',
			items: [
				{
					type: 'link',
					url: 'https://wordpress.com/comment/2/1',
					children: [ 'Comment' ],
					text: 'Comment',
				},
				' added',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Comment' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/comment/2/1' );
	} );

	it( 'renders plugin links for plugin ranges', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Activated Akismet today',
			items: [
				'Activated ',
				{
					type: 'plugin',
					pluginSlug: 'akismet',
					siteSlug: 'example.com',
					children: [ 'Akismet' ],
					text: 'Akismet',
				},
				' today',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Akismet' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/plugins/akismet/example.com' );
	} );

	it( 'renders theme links when themes originate from WordPress.com', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Installed Example today',
			items: [
				'Installed ',
				{
					type: 'theme',
					themeSlug: 'example',
					siteSlug: 'example.com',
					themeUri: 'https://wordpress.com/theme/example',
					children: [ 'Example' ],
					text: 'Example',
				},
				' today',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Example' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/theme/example/example.com' );
	} );

	it( 'renders external theme links with target and rel attributes', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'External theme installed',
			items: [
				{
					type: 'theme',
					themeSlug: 'external-theme',
					siteSlug: 'site-slug',
					themeUri: 'https://example.com/theme',
					children: [ 'External theme' ],
					text: 'External theme',
				},
				' installed',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'External theme' } );
		expect( link.getAttribute( 'href' ) ).toBe( 'https://example.com/theme' );
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
	} );

	it( 'renders backup links with site slug fallback', () => {
		const activityDescription: ActivityDescription = {
			textDescription: 'Restored backup now',
			items: [
				'Restored ',
				{
					type: 'backup',
					siteSlug: 'site-slug',
					children: [ 'backup' ],
					text: 'backup',
				},
				' now',
			],
		};
		const activity = createActivity( { activityDescription } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'backup' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/backup/site-slug' );
	} );
} );
