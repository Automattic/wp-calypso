/**
 * @jest-environment jsdom
 */

import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';
import { COURSE_SLUGS } from '../../../data/courses';
import VideoUI from '../index';
import VideoChapters from '../video-chapters';

const useCourseData = () => {
	return {
		course: {
			videos: [],
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
		updateUserCourseProgression: jest.fn(),
	};
};

jest.mock( 'calypso/data/courses', () => ( {
	COURSE_SLUGS: {
		BLOGGING_QUICK_START: 'blogging-quick-start',
	},
	useCourseData,
	useUpdateUserCourseProgressionMutation,
} ) );

describe( 'Video-UI', () => {
	beforeEach( () => {
		window._tkq = {
			push: jest.fn(),
		};
	} );

	test( 'Track event with intent prop', () => {
		const useStateMock = ( useState ) => [ useState, jest.fn() ];
		jest.spyOn( React, 'useState' ).mockImplementation( useStateMock );
		const initialState = {
			ui: { section: 'test' },
			documentHead: { unreadCount: 1 },
		};
		const store = createStore( ( state ) => state, initialState );

		const result = mount(
			<Provider store={ store }>
				<VideoUI
					store={ store }
					FooterBar={ ( footerProps ) => <ModalFooterBar { ...footerProps } /> }
					HeaderBar={ ( headerProps ) => <ModalHeaderBar { ...headerProps } /> }
					intent="build"
				/>
			</Provider>
		);

		result.find( VideoChapters ).first().prop( 'onVideoPlayClick' )();

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
			},
		] );
	} );

	test( 'Track event without intent prop', () => {
		const useStateMock = ( useState ) => [ useState, jest.fn() ];
		jest.spyOn( React, 'useState' ).mockImplementation( useStateMock );
		const initialState = {
			ui: { section: 'test' },
			documentHead: { unreadCount: 1 },
		};
		const store = createStore( ( state ) => state, initialState );

		const result = mount(
			<Provider store={ store }>
				<VideoUI
					store={ store }
					FooterBar={ ( footerProps ) => <ModalFooterBar { ...footerProps } /> }
					HeaderBar={ ( headerProps ) => <ModalHeaderBar { ...headerProps } /> }
				/>
			</Provider>
		);

		result.find( VideoChapters ).first().prop( 'onVideoPlayClick' )();

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
			},
		] );
	} );
} );
