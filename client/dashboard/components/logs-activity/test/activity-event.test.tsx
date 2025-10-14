/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ActivityLogEntry } from '../../../../../packages/api-core/src';
import isA8CForAgencies from '../../../../lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from '../../../../lib/jetpack/is-jetpack-cloud';
import parseActivityLogEntryContent from '../../logs-activity-formatted-block/api-core-parser';
import { ActivityEvent } from '../activity-event';
import type { Activity } from '../types';

jest.mock( '@automattic/calypso-config', () => jest.fn( () => '' ) );
jest.mock( '../../../../lib/jetpack/is-jetpack-cloud', () => jest.fn( () => false ) );
jest.mock( '../../../../lib/a8c-for-agencies/is-a8c-for-agencies', () => jest.fn( () => false ) );

const mockedIsJetpackCloud = isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud >;
const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;

type ContentInput = ActivityLogEntry[ 'content' ] | string | undefined;

const createActivity = ( {
	title = 'Summary',
	icon,
	content,
}: {
	title?: string;
	icon?: string;
	content?: ContentInput;
} = {} ): Activity => {
	const items = parseActivityLogEntryContent( content );
	const textDescription = typeof content === 'string' ? content : content?.text ?? '';

	return {
		activityDescription: {
			textDescription,
			items,
		},
		activityIcon: icon,
		activityId: 1,
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
		const activity = createActivity( { content: { text: 'Plain content' } } );

		render( <ActivityEvent activity={ activity } /> );

		expect( screen.getByText( 'Summary' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plain content' ) ).toBeInTheDocument();
	} );

	it( 'renders formatted content with links', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'View' } );
		expect( link ).toBeInTheDocument();
		expect( link.getAttribute( 'href' ) ).toBe( '/post/example' );
	} );

	it( 'renders strong ranges as bold text', () => {
		const content: ActivityLogEntry[ 'content' ] = {
			text: 'A Bold move',
			ranges: [
				{
					id: 'strong',
					indices: [ 2, 6 ],
					type: 'strong',
				},
			],
		};
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const strong = screen.getByText( 'Bold' );
		expect( strong.tagName ).toBe( 'STRONG' );
	} );

	it( 'renders emphasis ranges inside <em>', () => {
		const content: ActivityLogEntry[ 'content' ] = {
			text: 'Very important',
			ranges: [
				{
					id: 'em',
					indices: [ 5, 14 ],
					type: 'em',
				},
			],
		};
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const emphasis = screen.getByText( 'important' );
		expect( emphasis.tagName ).toBe( 'EM' );
	} );

	it( 'renders preformatted ranges inside <pre>', () => {
		const content: ActivityLogEntry[ 'content' ] = {
			text: 'Code block',
			ranges: [
				{
					id: 'pre',
					indices: [ 0, 4 ],
					type: 'pre',
				},
			],
		};
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const pre = screen.getByText( 'Code' );
		expect( pre.tagName ).toBe( 'PRE' );
	} );

	it( 'renders file paths inside a <code> element', () => {
		const content: ActivityLogEntry[ 'content' ] = {
			text: 'File wp-config.php',
			ranges: [
				{
					id: 'filepath',
					indices: [ 5, 18 ],
					type: 'filepath',
				},
			],
		};
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const code = screen.getByText( 'wp-config.php' );
		expect( code.tagName ).toBe( 'CODE' );
	} );

	it( 'renders post links when post ranges are provided', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Example' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/reader/blogs/123/posts/77' );
	} );

	it( 'renders comment links with anchors', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Comment' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/comment/2/1' );
	} );

	it( 'renders plugin links for plugin ranges', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Akismet' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/plugins/akismet/example.com' );
	} );

	it( 'renders theme links when themes originate from WordPress.com', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'Example' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/theme/example/example.com' );
	} );

	it( 'renders external theme links with target and rel attributes', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'External theme' } );
		expect( link.getAttribute( 'href' ) ).toBe( 'https://example.com/theme' );
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
	} );

	it( 'renders backup links with site slug fallback', () => {
		const content: ActivityLogEntry[ 'content' ] = {
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
		const activity = createActivity( { content } );

		render( <ActivityEvent activity={ activity } /> );

		const link = screen.getByRole( 'link', { name: 'backup' } );
		expect( link.getAttribute( 'href' ) ).toBe( '/backup/site-slug' );
	} );
} );
