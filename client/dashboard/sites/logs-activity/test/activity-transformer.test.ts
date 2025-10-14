import { transformActivityLogEntry } from '../activity-transformer';
import type { ActivityLogEntry } from '@automattic/api-core';

describe( 'transformActivityLogEntry', () => {
	it( 'maps API entry to Activity structure', () => {
		const entry: ActivityLogEntry = {
			activity_id: '42',
			actor: {
				name: 'Jane Doe',
				role: 'administrator',
				type: 'Person',
				is_cli: true,
				is_happiness: false,
				icon: {
					type: 'Image',
					url: 'https://example.com/avatar.png',
				},
			},
			content: {
				text: 'View post',
				ranges: [
					{
						id: 'range-1',
						indices: [ 0, 4 ],
						type: 'link',
						url: 'https://wordpress.com/post/example',
					},
				],
			},
			type: 'Announce',
			gridicon: 'info',
			image: {
				available: true,
				medium_url: 'https://example.com/medium.jpg',
				name: 'Preview',
				url: 'https://example.com/original.jpg',
			},
			last_published: '2024-01-01T00:00:00Z',
			name: 'test__activity',
			generator: { blog_id: 1 },
			is_rewindable: true,
			object: { rewind_id: 'rewind' },
			published: '2024-01-01T00:00:00Z',
			rewind_id: 'rewind',
			status: 'success',
			summary: 'Summary',
			streams: [],
		};
		const activity = transformActivityLogEntry( entry );

		expect( activity.activityTitle ).toBe( 'Summary' );
		expect( activity.activityDescription.textDescription ).toBe( 'View post' );
		expect( activity.activityDescription.items ).toHaveLength( 2 );
		expect( activity.activityIcon ).toBe( 'info' );
		expect( activity.activityId ).toBe( '42' );
		expect( activity.activityMedia.available ).toBe( true );
		expect( activity.activityMedia.medium_url ).toBe( 'https://example.com/medium.jpg' );
		expect( activity.activityActor.actorName ).toBe( 'Jane Doe' );
		expect( activity.activityActor.isCli ).toBe( true );
		expect( activity.activityActor.isSupport ).toBe( false );
		expect( activity.activityTs ).toBe( Date.parse( '2024-01-01T00:00:00Z' ) );
		expect( activity.activityUnparsedTs ).toBe( '2024-01-01T00:00:00Z' );
		expect( activity.activityIsRewindable ).toBe( true );
		expect( activity.rewindId ).toBe( 'rewind' );
	} );

	it( 'provides defaults when optional fields are missing', () => {
		const entry: ActivityLogEntry = {
			activity_id: 'not-a-number',
			actor: {
				name: 'System',
				type: 'Application',
			},
			content: {
				text: 'No ranges',
			},
			type: 'Announce',
			gridicon: '',
			last_published: '2024-01-02T00:00:00Z',
			name: 'test__other',
			is_rewindable: false,
			published: '',
			rewind_id: '',
			status: null,
			summary: 'Fallback',
			streams: [],
		};
		const activity = transformActivityLogEntry( entry );

		expect( activity.activityId ).toBe( 'not-a-number' );
		expect( activity.activityMedia.available ).toBe( false );
		expect( activity.activityMedia.medium_url ).toBe( '' );
		expect( activity.activityDescription.items ).toEqual( [ 'No ranges' ] );
		expect( activity.activityStatus ).toBe( '' );
		expect( activity.activityTs ).toBe( 0 );
		expect( activity.rewindId ).toBeUndefined();
	} );
} );
