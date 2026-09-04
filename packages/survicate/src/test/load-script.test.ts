/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { loadScript } from '@automattic/load-script';
import { select } from '@wordpress/data';
import { loadSurvicateScript } from '../load-script';

const mockSelect = select as jest.Mock;
const mockRecordTracksEvent = recordTracksEvent as jest.Mock;

function setHelpCenterOpen( open: boolean ) {
	mockSelect.mockReturnValue( { isHelpCenterShown: () => open } );
}

describe( 'loadSurvicateScript', () => {
	let controller: AbortController;

	beforeEach( () => {
		window._sva = undefined;
		setHelpCenterOpen( false );
		controller = new AbortController();
	} );

	afterEach( () => {
		// Disconnect the modal observer and survey_displayed listener wired by
		// this test so they don't fire during later tests on the shared DOM.
		controller.abort();
		window._sva = undefined;
		mockSelect.mockReset();
		mockRecordTracksEvent.mockReset();
		document.body.innerHTML = '';
	} );

	test( 'should call loadScript with the correct Survicate URL', async () => {
		await loadSurvicateScript( 'test-workspace-id', controller.signal );

		expect( loadScript ).toHaveBeenCalledWith(
			'https://survey.survicate.com/workspaces/test-workspace-id/web_surveys.js'
		);
	} );

	test( 'should propagate errors from loadScript', async () => {
		( loadScript as jest.Mock ).mockRejectedValueOnce( new Error( 'load failed' ) );

		await expect( loadSurvicateScript( 'test-id', controller.signal ) ).rejects.toThrow(
			'load failed'
		);
	} );

	test( 'should close the survey when it is displayed while the Help Center is open', () => {
		const closeSurvey = jest.fn();
		const addEventListener = jest.fn();
		window._sva = { closeSurvey, addEventListener };

		loadSurvicateScript( 'test-workspace-id', controller.signal );

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

		loadSurvicateScript( 'test-workspace-id', controller.signal );

		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		setHelpCenterOpen( false );
		const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
		onSurveyDisplayed();

		expect( closeSurvey ).not.toHaveBeenCalled();
	} );

	test( 'should close the survey when it is displayed while a modal is open', () => {
		const closeSurvey = jest.fn();
		const addEventListener = jest.fn();
		window._sva = { closeSurvey, addEventListener };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );

		const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
		onSurveyDisplayed();

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_survicate_survey_suppressed', {
			reason: 'modal',
			trigger: 'survey_displayed',
		} );
	} );

	test( 'should close a visible survey when a modal opens', async () => {
		const closeSurvey = jest.fn();
		window._sva = { closeSurvey, addEventListener: jest.fn() };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should record a suppression when a modal opens over a visible survey', async () => {
		const closeSurvey = jest.fn();
		window._sva = { closeSurvey, addEventListener: jest.fn() };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		// A Survicate survey is on screen (its dialog lives inside #survicate-box).
		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		const survey = document.createElement( 'div' );
		survey.setAttribute( 'role', 'dialog' );
		( survey as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		box.appendChild( survey );
		document.body.appendChild( box );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_survicate_survey_suppressed', {
			reason: 'modal',
			trigger: 'modal_opened',
		} );
	} );

	test( 'should not record a suppression when a modal opens with no survey visible', async () => {
		const closeSurvey = jest.fn();
		window._sva = { closeSurvey, addEventListener: jest.fn() };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'should pause targeting when a survey displays while a modal is open', () => {
		const closeSurvey = jest.fn();
		const addEventListener = jest.fn();
		window._sva = { closeSurvey, addEventListener };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );

		const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
		onSurveyDisplayed();

		expect( window._sva.disableTargeting ).toBe( true );
	} );

	test( 'should not pause targeting for a Help Center suppression', () => {
		const closeSurvey = jest.fn();
		const addEventListener = jest.fn();
		window._sva = { closeSurvey, addEventListener };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		setHelpCenterOpen( true );
		const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
		onSurveyDisplayed();

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
		expect( window._sva.disableTargeting ).toBeFalsy();
	} );

	test( 'should pause targeting up front when a modal is already open at SDK-ready time', () => {
		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );

		window._sva = { addEventListener: jest.fn() };
		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( window._sva.disableTargeting ).toBe( true );
	} );

	test( 'should resume targeting when the last modal closes', async () => {
		const retarget = jest.fn();
		window._sva = { closeSurvey: jest.fn(), addEventListener: jest.fn(), retarget };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( window._sva.disableTargeting ).toBe( true );

		modal.remove();
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( window._sva.disableTargeting ).toBe( false );
		expect( retarget ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should resume targeting when the consumer aborts while paused', async () => {
		const retarget = jest.fn();
		window._sva = { closeSurvey: jest.fn(), addEventListener: jest.fn(), retarget };

		loadSurvicateScript( 'test-workspace-id', controller.signal );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( window._sva.disableTargeting ).toBe( true );

		controller.abort();

		expect( window._sva.disableTargeting ).toBe( false );
		modal.remove();
	} );

	test( 'should re-establish modal suppression when reloaded after the SDK is ready', async () => {
		const closeSurvey = jest.fn();
		const firstController = new AbortController();

		// First load waits for SurvicateReady (SDK not yet present), then the SDK
		// becomes ready and wires the observer.
		loadSurvicateScript( 'test-workspace-id', firstController.signal );
		window._sva = { closeSurvey, addEventListener: jest.fn() };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		// The consumer effect re-runs: its cleanup aborts, tearing the first
		// observer down.
		firstController.abort();

		// Reload with a fresh signal. SurvicateReady won't fire again this page
		// load, so suppression must be wired immediately from the ready SDK.
		loadSurvicateScript( 'test-workspace-id', controller.signal );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	} );
} );
