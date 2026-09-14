/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/react';
import VideoPlayer from '../video-player';

describe( 'Video player', () => {
	const videoData = {
		poster: 'image.png',
		url: 'video.mp4',
	};
	const course = { slug: 'course-slug' };

	beforeEach( () => {
		window._tkq = {
			push: jest.fn(),
		};
	} );

	const renderPlayer = ( props ) =>
		render(
			<VideoPlayer
				course={ course }
				videoData={ videoData }
				onVideoPlayStatusChanged={ jest.fn() }
				onVideoCompleted={ jest.fn() }
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
