/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { NpsSurvey } from '../';

jest.mock( 'react-redux', () => ( {
	connect: () => () => {},
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
		recordTracksEventAction: jest.fn(),
		translate,
	};

	beforeEach( () => {
		mockedProps.recordTracksEventAction.mockReset();
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
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_page_displayed',
			{
				name: 'feedback',
				has_available_concierge_sessions: true,
			}
		);
		wrapper.find( '.nps-survey__finish-button' ).simulate( 'click' );

		expect( wrapper.state( 'currentForm' ) ).toBe( 'promotion' );
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_page_displayed',
			{
				name: 'promotion',
				has_available_concierge_sessions: true,
			}
		);
	} );

	test( 'should track the concierge session availability too', () => {
		const wrapper = shallow(
			<NpsSurvey { ...mockedProps } hasAvailableConciergeSession={ false } />
		);

		wrapper.setState( {
			score: 6,
			feedback: 'feedback',
		} );

		expect( wrapper.state( 'currentForm' ) ).toBe( 'score' );
		wrapper.find( '.nps-survey__finish-button' ).simulate( 'click' );
		// we don't track the first page.

		expect( wrapper.state( 'currentForm' ) ).toBe( 'feedback' );
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_page_displayed',
			{
				name: 'feedback',
				has_available_concierge_sessions: false,
			}
		);
		wrapper.find( '.nps-survey__finish-button' ).simulate( 'click' );

		expect( wrapper.state( 'currentForm' ) ).toBe( 'promotion' );
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_page_displayed',
			{
				name: 'promotion',
				has_available_concierge_sessions: false,
			}
		);
	} );

	test( 'should track when any link in the promotion page is clicked', () => {
		const wrapper = mount( <NpsSurvey { ...mockedProps } /> );

		wrapper.setState( {
			score: 6,
			feedback: 'feedback',
			currentForm: 'promotion',
		} );

		expect( wrapper.state( 'currentForm' ) ).toBe( 'promotion' );
		expect( wrapper.find( 'a[data-type]' ) ).toHaveLength( 2 );

		wrapper.find( 'a[data-type="booking"]' ).simulate( 'click' );
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_link_clicked',
			{
				url: 'https://example.com/me/concierge',
				type: 'booking',
			}
		);

		wrapper.find( 'a[data-type="contact"]' ).simulate( 'click' );
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_link_clicked',
			{
				url: 'https://example.com/help/contact',
				type: 'contact',
			}
		);

		// When the user used up concierge sessions
		wrapper.setProps( { ...mockedProps, hasAvailableConciergeSession: false } );

		// There will be only one contact link
		expect( wrapper.find( 'a[data-type]' ) ).toHaveLength( 1 );

		wrapper.find( 'a[data-type="contact"]' ).simulate( 'click' );
		expect( mockedProps.recordTracksEventAction ).toHaveBeenLastCalledWith(
			'calypso_nps_survey_link_clicked',
			{
				url: 'https://example.com/help/contact',
				type: 'contact',
			}
		);
	} );
} );
