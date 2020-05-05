/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import SuggestionSearch from '..';
import { recordTracksEvent } from 'lib/analytics/tracks';

jest.mock( 'lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'SuggestionSearch', () => {
	describe( 'fires analytics with railcar prop', () => {
		beforeEach( () => {
			recordTracksEvent.mockReset();
		} );

		test( 'rendering fires traintracks render events', () => {
			const suggestions = [ { label: 'My Label', value: 'My Value' } ];
			const wrapper = shallow(
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

			wrapper.instance().onSuggestionItemMount( { index: 0, suggestionIndex: 0 } );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
				fetch_algo: 'THE_FETCH_ALGO',
				fetch_position: 0,
				railcar: 'RAILCAR-ID-0',
				ui_algo: 'THE_UI_ALGO',
				ui_position: 0,
			} );
		} );

		test( 'mousedown fires traintracks mousedown events', () => {
			const suggestions = [ { label: 'My Label', value: 'My Value' } ];
			const wrapper = shallow(
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

			wrapper.instance().handleSuggestionMouseDown( suggestions[ 0 ], 0 );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_traintracks_interact', {
				action: 'THE_ACTION',
				railcar: 'RAILCAR-ID-0',
			} );
		} );
	} );
} );
