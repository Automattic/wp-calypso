/** @format */
/**
 * Internal dependencies
 */
import { fetchLanguageNames, fetchLanguageNamesSuccess, fetchLanguageNamesError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receiveLanguageNames,
	requestLanguageNamesFailed,
} from 'state/i18n/language-names/actions';
import { LOCALIZED_LANGUAGE_NAMES_DATA_DE } from 'state/i18n/language-names/test/fixture';

describe( 'wpcom-api', () => {
	describe( 'i18n language-names request', () => {
		describe( '#fetchLanguageNames', () => {
			test( 'should return HTTP request to i18n/language-names endpoint', () => {
				const action = { type: 'DUMMY' };

				expect( fetchLanguageNames( action ) ).toEqual(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/i18n/language-names',
						},
						action
					)
				);
			} );
		} );

		describe( '#fetchLanguageNamesSuccess', () => {
			test( 'should return localized language names', () => {
				const languageNames = LOCALIZED_LANGUAGE_NAMES_DATA_DE;
				const action = receiveLanguageNames( languageNames );

				expect( fetchLanguageNamesSuccess( action, languageNames ) ).toEqual( [
					receiveLanguageNames( languageNames ),
				] );
			} );
		} );

		describe( '#fetchLanguageNamesError', () => {
			test( 'should return error', () => {
				const error = 'could not find localized language names';
				const action = requestLanguageNamesFailed( error );

				expect( fetchLanguageNamesError( action, error ) ).toEqual(
					requestLanguageNamesFailed( error )
				);
			} );
		} );
	} );
} );
