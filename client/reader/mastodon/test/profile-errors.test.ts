/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { errorMessage, followErrorMessage } from '../profile-errors';
import type { MastodonError } from '@automattic/api-core';

function getTranslate() {
	const { result } = renderHook( () => useTranslate() );
	return result.current;
}

describe( 'followErrorMessage', () => {
	it( 'returns follow-shaped copy for not_found + follow', () => {
		const translate = getTranslate();
		const error: MastodonError = { kind: 'not_found' };
		expect( String( followErrorMessage( error, 'follow', translate ) ) ).toBe(
			'Couldn’t follow this account.'
		);
	} );

	it( 'returns unfollow-shaped copy for not_found + unfollow', () => {
		const translate = getTranslate();
		const error: MastodonError = { kind: 'not_found' };
		expect( String( followErrorMessage( error, 'unfollow', translate ) ) ).toBe(
			'Couldn’t unfollow this account.'
		);
	} );

	it( 'delegates to errorMessage for non-not_found kinds (action context preserved by caller)', () => {
		const translate = getTranslate();
		const error: MastodonError = { kind: 'rate_limited' };
		expect( String( followErrorMessage( error, 'follow', translate ) ) ).toBe(
			String( errorMessage( error, translate ) )
		);
	} );

	it( 'delegates to errorMessage for auth_failed', () => {
		const translate = getTranslate();
		const error: MastodonError = { kind: 'auth_failed' };
		expect( String( followErrorMessage( error, 'unfollow', translate ) ) ).toBe(
			String( errorMessage( error, translate ) )
		);
	} );
} );

describe( 'errorMessage', () => {
	it( 'projects auth_required to a reauth-shaped string', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'auth_required' }, translate ) );
		expect( message ).toMatch( /re-authoriz/i );
	} );

	it( 'projects rate_limited to slow-down copy', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'rate_limited' }, translate ) );
		expect( message ).toMatch( /slow down/i );
	} );

	it( 'projects not_found to the profile-load copy', () => {
		const translate = getTranslate();
		expect( String( errorMessage( { kind: 'not_found' }, translate ) ) ).toBe(
			'We couldn’t find that profile.'
		);
	} );
} );
