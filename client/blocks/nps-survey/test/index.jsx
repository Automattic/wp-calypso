/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { NpsSurvey } from '../';

jest.mock( 'react-redux', () => ( {
	connect: () => () => {},
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: component => component,
	getLocaleSlug: () => 'en',
} ) );

jest.mock( 'state/nps-survey/actions' );
jest.mock( 'state/analytics/actions' );
jest.mock( 'state/notices/actions' );

describe( 'NpsSurvey', () => {
	const mockedProps = {
		name: 'test-survey',
		onChangeForm: jest.fn(),
		onClose: jest.fn(),
		isBusinessUser: true,
		hasAnswered: false,
		hasAvailableConciergeSession: true,
		submitNpsSurvey: jest.fn(),
		submitNpsSurveyWithNoScore: jest.fn(),
		sendNpsSurveyFeedback: jest.fn(),
		successNotice: jest.fn(),
		recordTracksEvent: jest.fn(),
		translate: str => str,
	};

	beforeEach( () => {
		mockedProps.recordTracksEvent.mockReset();
	} );

	test( 'should track current page in the dialog', () => {
		const wrapper = shallow( <NpsSurvey { ...mockedProps } /> );

		wrapper.setState( {
			score: 6,
			feedback: 'feedback',
		} );

		expect( wrapper.state( 'currentForm' ) ).toBe( 'score' );
		wrapper.find( '.nps-survey__finish-button' ).simulate( 'click' );
		// we don't track the first page.

		expect( wrapper.state( 'currentForm' ) ).toBe( 'feedback' );
		expect( mockedProps.recordTracksEvent ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_page_displayed',
			{ name: 'feedback' }
		);
		wrapper.find( '.nps-survey__finish-button' ).simulate( 'click' );

		expect( wrapper.state( 'currentForm' ) ).toBe( 'promotion' );
		expect( mockedProps.recordTracksEvent ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_page_displayed',
			{ name: 'promotion' }
		);
	} );
} );
