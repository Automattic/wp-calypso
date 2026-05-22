/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { errorMessage, followErrorMessage } from '../profile-errors';
import type { FediverseError } from '@automattic/api-core';

function getTranslate() {
	const { result } = renderHook( () => useTranslate() );
	return result.current;
}

describe( 'followErrorMessage', () => {
	it( 'returns follow-shaped copy for not_found + follow', () => {
		const translate = getTranslate();
		const error: FediverseError = { kind: 'not_found' };
		expect( String( followErrorMessage( error, 'follow', translate ) ) ).toBe(
			'Couldn’t follow this account.'
		);
	} );

	it( 'returns unfollow-shaped copy for not_found + unfollow', () => {
		const translate = getTranslate();
		const error: FediverseError = { kind: 'not_found' };
		expect( String( followErrorMessage( error, 'unfollow', translate ) ) ).toBe(
			'Couldn’t unfollow this account.'
		);
	} );

	it( 'delegates to errorMessage for non-not_found kinds (action context preserved by caller)', () => {
		const translate = getTranslate();
		const error: FediverseError = { kind: 'rate_limited' };
		expect( String( followErrorMessage( error, 'follow', translate ) ) ).toBe(
			String( errorMessage( error, translate ) )
		);
	} );

	it( 'delegates to errorMessage for auth_required', () => {
		const translate = getTranslate();
		const error: FediverseError = { kind: 'auth_required' };
		expect( String( followErrorMessage( error, 'unfollow', translate ) ) ).toBe(
			String( errorMessage( error, translate ) )
		);
	} );
} );

describe( 'errorMessage', () => {
	it( 'projects auth_required to a connection-error string', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'auth_required' }, translate ) );
		expect( message ).toMatch( /Fediverse connection/i );
	} );

	it( 'projects connection_not_found to a no-longer-available string', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'connection_not_found' }, translate ) );
		expect( message ).toMatch( /no longer available/i );
	} );

	it( 'projects rate_limited to slow-down copy', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'rate_limited' }, translate ) );
		expect( message ).toMatch( /slow down/i );
	} );

	it( 'projects upstream_unavailable to an unreachable copy', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'upstream_unavailable' }, translate ) );
		expect( message ).toMatch( /unreachable/i );
	} );

	it( 'projects not_found to a profile-shaped copy', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'not_found' }, translate ) );
		expect( message ).toMatch( /couldn’t find that profile/i );
	} );

	it( 'projects unknown to the generic Something went wrong copy', () => {
		const translate = getTranslate();
		const message = String( errorMessage( { kind: 'unknown', cause: null }, translate ) );
		expect( message ).toBe( 'Something went wrong.' );
	} );

	it( 'falls back to the generic copy via the `default:` arm for unrecognised kinds', () => {
		// Cast through `unknown` so a future widening of `FediverseError` is
		// still observable as a runtime hit on the `default:` arm — same
		// pattern the Mastodon test uses.
		const translate = getTranslate();
		// Mute the devtools warn the default arm emits.
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const message = String(
			errorMessage( { kind: 'newly-added-variant' } as unknown as FediverseError, translate )
		);
		expect( message ).toBe( 'Something went wrong.' );
		expect( warn ).toHaveBeenCalled();
		warn.mockRestore();
	} );
} );
