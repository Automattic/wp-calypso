/**
 * @jest-environment jsdom
 */
jest.mock( '../../utils/open-help-center-chat', () => ( { openHelpCenterChat: jest.fn() } ) );
jest.mock( '../../utils/tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );

import { fireEvent, render, screen } from '@testing-library/react';
import { openHelpCenterChat } from '../../utils/open-help-center-chat';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import OpenHelpCenterButton from '../open-help-center-button';

beforeEach( () => jest.clearAllMocks() );

describe( 'OpenHelpCenterButton', () => {
	it( 'records when it is shown, and opens the support chat with the message on click', () => {
		render( <OpenHelpCenterButton message="Summary for support." /> );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_open_help_center_button_shown'
		);
		expect( openHelpCenterChat ).not.toHaveBeenCalled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Get help' } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_open_help_center_button_click'
		);
		expect( openHelpCenterChat ).toHaveBeenCalledWith( 'Summary for support.' );
	} );

	it( 'does not count a stale row as shown, but still opens the chat on click', () => {
		render( <OpenHelpCenterButton message="Summary." isMessageStale /> );

		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Get help' } ) );

		expect( openHelpCenterChat ).toHaveBeenCalledWith( 'Summary.' );
	} );
} );
