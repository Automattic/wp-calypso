/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
} ) );

import { loadScript } from '@automattic/load-script';
import { select } from '@wordpress/data';
import { loadSurvicateScript } from '../load-script';

const mockSelect = select as jest.Mock;

function setHelpCenterOpen( open: boolean ) {
	mockSelect.mockReturnValue( { isHelpCenterShown: () => open } );
}

describe( 'loadSurvicateScript', () => {
	beforeEach( () => {
		window._sva = undefined;
		setHelpCenterOpen( false );
	} );

	afterEach( () => {
		window._sva = undefined;
		mockSelect.mockReset();
	} );

	test( 'should call loadScript with the correct Survicate URL', async () => {
		await loadSurvicateScript( 'test-workspace-id' );

		expect( loadScript ).toHaveBeenCalledWith(
			'https://survey.survicate.com/workspaces/test-workspace-id/web_surveys.js'
		);
	} );

	test( 'should propagate errors from loadScript', async () => {
		( loadScript as jest.Mock ).mockRejectedValueOnce( new Error( 'load failed' ) );

		await expect( loadSurvicateScript( 'test-id' ) ).rejects.toThrow( 'load failed' );
	} );

	test( 'should close the survey when it is displayed while the Help Center is open', () => {
		const closeSurvey = jest.fn();
		const addEventListener = jest.fn();
		window._sva = { closeSurvey, addEventListener };

		loadSurvicateScript( 'test-workspace-id' );

		// Survicate signals readiness, which registers the survey_displayed listener.
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( addEventListener ).toHaveBeenCalledWith( 'survey_displayed', expect.any( Function ) );

		// Simulate a survey being displayed while the Help Center is open.
		setHelpCenterOpen( true );
		const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
		onSurveyDisplayed();

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should not close the survey when the Help Center is closed', () => {
		const closeSurvey = jest.fn();
		const addEventListener = jest.fn();
		window._sva = { closeSurvey, addEventListener };

		loadSurvicateScript( 'test-workspace-id' );

		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		setHelpCenterOpen( false );
		const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
		onSurveyDisplayed();

		expect( closeSurvey ).not.toHaveBeenCalled();
	} );
} );
