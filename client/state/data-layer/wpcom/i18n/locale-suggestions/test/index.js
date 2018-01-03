/** @format */

/**
 * Internal dependencies
 */
import { fetchLocaleSuggestions, localeSuggestionsReceive } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveLocaleSuggestions } from 'state/i18n/locale-suggestions/actions';

describe( 'locale suggestions request', () => {
	describe( 'successful requests', () => {
		test( 'should return HTTP request to /locale-guess endpoint', () => {
			const action = { type: 'SOME_ACTION' };

			expect( fetchLocaleSuggestions( action ) ).toEqual(
				http(
					{
						apiVersion: '1.1',
						method: 'GET',
						path: '/locale-guess',
					},
					action
				)
			);
		} );
	} );

	describe( '#localeSuggestionsReceive', () => {
		test( 'should return locale suggestionss', () => {
			const responseData = [
				{
					locale: 'kli',
					name: 'Klingon',
					availability_text: 'nuqDaq `oH puchpa``e`',
				},
			];
			expect( localeSuggestionsReceive( {}, responseData ) ).toEqual(
				receiveLocaleSuggestions( responseData )
			);
		} );
	} );
} );
