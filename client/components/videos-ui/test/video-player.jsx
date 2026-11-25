/**
 * @vitest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';
import VideoPlayer from '../video-player';

describe( 'Video player', () => {
	const videoData = {
		poster: 'image.png',
		url: 'video.mp4',
	};
	const course = { slug: 'course-slug' };

	beforeEach( () => {
		window._tkq = {
			push: vi.fn(),
		};
	} );

	const renderPlayer = ( props ) =>
		render(
			<VideoPlayer
				course={ course }
				videoData={ videoData }
				onVideoPlayStatusChanged={ vi.fn() }
				onVideoCompleted={ vi.fn() }
				{ ...props }
			/>
		);

	test( 'Track event with intent prop', () => {
		const { container } = renderPlayer( { intent: 'build' } );

		fireEvent.play( container.querySelector( 'video' ) );

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_video_player_play_click',
			{
				course: 'course-slug',
				intent: 'build',
			},
		] );
	} );

	test( 'Track event without intent prop', () => {
		const { container } = renderPlayer();

		fireEvent.play( container.querySelector( 'video' ) );

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_video_player_play_click',
			{
				course: 'course-slug',
			},
		] );
	} );
} );
