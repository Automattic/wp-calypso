/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SuggestionSearch from '..';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'SuggestionSearch', () => {
	describe( 'fires analytics with railcar prop', () => {
		beforeEach( () => {
			recordTracksEvent.mockReset();
		} );

		test( 'rendering fires traintracks render events', async () => {
			const user = userEvent.setup();
			const suggestions = [ { label: 'My Label', value: 'My Value' } ];
			render(
				<SuggestionSearch
					suggestions={ suggestions }
					railcar={ {
						id: 'RAILCAR-ID',
						fetch_algo: 'THE_FETCH_ALGO',
						action: 'THE_ACTION',
						ui_algo: 'THE_UI_ALGO',
					} }
				/>
			);
			const input = screen.getByRole( 'textbox' );
			await user.type( input, 'My' );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
				fetch_algo: 'THE_FETCH_ALGO',
				fetch_position: 0,
				railcar: 'RAILCAR-ID-0',
				ui_algo: 'THE_UI_ALGO',
				ui_position: 0,
			} );
		} );

		test( 'mousedown fires traintracks mousedown events', async () => {
			const user = userEvent.setup();
			const suggestions = [ { label: 'My Label', value: 'My Value' } ];
			render(
				<SuggestionSearch
					suggestions={ suggestions }
					railcar={ {
						id: 'RAILCAR-ID',
						fetch_algo: 'THE_FETCH_ALGO',
						action: 'THE_ACTION',
						ui_algo: 'THE_UI_ALGO',
					} }
				/>
			);

			const input = screen.getByRole( 'textbox' );
			await user.type( input, 'My' );

			const btn = screen.getByRole( 'button', { name: 'My Label' } );
			await user.click( btn );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_traintracks_interact', {
				action: 'THE_ACTION',
				railcar: 'RAILCAR-ID-0',
			} );
		} );
	} );
} );
