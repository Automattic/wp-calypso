/**
 * @jest-environment jsdom
 */

import ShallowRenderer from 'react-test-renderer/shallow';
import VideoPlayer from '../video-player';

describe( 'Video player', () => {
	let renderer;

	const videoData = {
		poster: 'image.png',
		url: 'video.mp4',
	};
	const course = { slug: 'course-slug' };

	beforeEach( () => {
		renderer = new ShallowRenderer();

		window._tkq = {
			push: jest.fn(),
		};
	} );

	test( 'Track event with intent prop', () => {
		renderer.render( <VideoPlayer intent="build" course={ course } videoData={ videoData } /> );
		const result = renderer.getRenderOutput();

		// Video element.
		result.props.children[ 0 ].props.onPlay();

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
		renderer.render( <VideoPlayer course={ course } videoData={ videoData } /> );
		const result = renderer.getRenderOutput();

		// Video element.
		result.props.children[ 0 ].props.onPlay();

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_video_player_play_click',
			{
				course: 'course-slug',
			},
		] );
	} );
} );
