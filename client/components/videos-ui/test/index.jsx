/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { vi } from 'vitest';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';
import { COURSE_SLUGS } from '../../../data/courses';
import VideoUI from '../index';

const useCourseData = () => {
	return {
		course: {
			completions: {
				testvideo: false,
			},
			videos: {
				testvideo: {
					title: 'Video',
					duration_seconds: 60,
					description: 'Test description',
				},
			},
			cta: {
				action: 'action',
			},
			slug: COURSE_SLUGS.BLOGGING_QUICK_START,
		},
		isCourseComplete: () => false,
	};
};

const useUpdateUserCourseProgressionMutation = () => {
	return {
		updateUserCourseProgression: vi.fn(),
	};
};

const useCourseDetails = () => {
	return {
		headerTitle: '',
		headerSubtitle: '',
		headerSummary: [ '' ],
	};
};

vi.mock( 'calypso/data/courses', () => ( {
	COURSE_SLUGS: {
		BLOGGING_QUICK_START: 'blogging-quick-start',
	},
	// `vi.mock()` is hoisted above these helpers, so read them when called.
	useCourseData: () => useCourseData(),
	useCourseDetails: () => useCourseDetails(),
	useUpdateUserCourseProgressionMutation: () => useUpdateUserCourseProgressionMutation(),
} ) );

describe( 'Video-UI', () => {
	beforeEach( () => {
		window._tkq = {
			push: vi.fn(),
		};
	} );

	test( 'Track event with intent prop', async () => {
		const user = userEvent.setup();
		const useStateMock = ( useState ) => [ useState, vi.fn() ];
		vi.spyOn( React, 'useState' ).mockImplementation( useStateMock );
		const initialState = {
			ui: { section: 'test' },
			documentHead: { unreadCount: 1 },
		};
		const store = createStore( ( state ) => state, initialState );

		render(
			<Provider store={ store }>
				<VideoUI
					store={ store }
					FooterBar={ ( footerProps ) => <ModalFooterBar { ...footerProps } /> }
					HeaderBar={ ( headerProps ) => <ModalHeaderBar { ...headerProps } /> }
					intent="build"
				/>
			</Provider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Play video' } ) );

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_view',
			{
				course: COURSE_SLUGS.BLOGGING_QUICK_START,
				intent: 'build',
			},
		] );

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_play_click',
			{
				course: COURSE_SLUGS.BLOGGING_QUICK_START,
				intent: 'build',
				video: 'testvideo',
			},
		] );
	} );

	test( 'Track event without intent prop', async () => {
		const user = userEvent.setup();
		const useStateMock = ( useState ) => [ useState, vi.fn() ];
		vi.spyOn( React, 'useState' ).mockImplementation( useStateMock );
		const initialState = {
			ui: { section: 'test' },
			documentHead: { unreadCount: 1 },
		};
		const store = createStore( ( state ) => state, initialState );

		render(
			<Provider store={ store }>
				<VideoUI
					store={ store }
					FooterBar={ ( footerProps ) => <ModalFooterBar { ...footerProps } /> }
					HeaderBar={ ( headerProps ) => <ModalHeaderBar { ...headerProps } /> }
				/>
			</Provider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Play video' } ) );

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_view',
			{
				course: COURSE_SLUGS.BLOGGING_QUICK_START,
			},
		] );

		expect( window._tkq.push ).toHaveBeenCalledWith( [
			'recordEvent',
			'calypso_courses_play_click',
			{
				course: COURSE_SLUGS.BLOGGING_QUICK_START,
				video: 'testvideo',
			},
		] );
	} );
} );
