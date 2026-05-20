/**
 * Customize-mode save flow.
 *
 * POSTs the working delta to `wpcom/v2/wp-admin-sidebar/layout`, returns the
 * persisted delta, dispatches it into the layout state slice. Mirrors
 * `save()` in the public plugin's `customizer/customizer.js` v0.1.4 — error
 * shape, null-guards on cancel-mid-fetch, payload shape, success behaviour.
 *
 * The actual REST call uses Calypso's `wpcom-proxy-request` so the request
 * routes through the centralized public-api dispatcher (matching how the
 * existing admin-menu fetch works in the repo).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/customizer.js#save
 * @see WordPress/wp-admin-sidebar v0.1.4 src/class-sidebar-rest.php
 */
import { translate } from 'i18n-calypso';
import wpcomRequest from 'wpcom-proxy-request';
import { receiveAdminSidebarLayout } from 'calypso/state/admin-sidebar/layout/actions';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';
import type { Dispatch } from 'redux';

export interface SaveLayoutOptions {
	siteId: number | string;
	delta: LayoutDelta;
	/**
	 * Optional injection point for tests. When provided, used instead of
	 * `wpcomRequest`. The signature matches `wpcom-proxy-request` closely so
	 * production code doesn't need to change.
	 */
	requestImpl?: ( params: {
		path: string;
		apiNamespace: string;
		method: 'POST';
		body: LayoutDelta;
	} ) => Promise< LayoutDelta >;
}

/**
 * Submit the working delta to the layout endpoint and dispatch the persisted
 * shape into Redux on success.
 *
 * Resolves with the persisted delta. Rejects with an `Error` carrying the
 * message body's `message` (when the endpoint returned a structured error)
 * or a generic "Save failed." message.
 */
export async function saveLayout(
	dispatch: Dispatch,
	options: SaveLayoutOptions
): Promise< LayoutDelta > {
	const request = options.requestImpl ?? defaultRequest;

	let saved: LayoutDelta;
	try {
		saved = await request( {
			path: `/sites/${ options.siteId }/wp-admin-sidebar/layout`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: options.delta,
		} );
	} catch ( err ) {
		// `wpcom-proxy-request` rejects with the parsed JSON response on HTTP
		// error responses. Pass through the message field so the customizer's
		// live region surfaces a useful description.
		const message =
			err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
				? err.message
				: ( translate( 'Save failed.' ) as string );
		throw new Error( message );
	}

	if ( ! saved || typeof saved !== 'object' || ! Array.isArray( saved.overrides ) ) {
		throw new Error( translate( 'Save failed: malformed server response.' ) as string );
	}

	dispatch( receiveAdminSidebarLayout( options.siteId, saved ) );
	return saved;
}

async function defaultRequest( params: {
	path: string;
	apiNamespace: string;
	method: 'POST';
	body: LayoutDelta;
} ): Promise< LayoutDelta > {
	if ( isAdminSidebarDevMockActive() ) {
		return {
			...params.body,
			updated_at: Date.now(),
		};
	}
	// `wpcom-proxy-request` types the response as `unknown`; we narrow on the
	// way out. The signature `( params, callback? )` returns a Promise when
	// no callback is supplied.
	const response = ( await wpcomRequest( params ) ) as LayoutDelta;
	return response;
}

function isAdminSidebarDevMockActive() {
	if ( typeof window === 'undefined' || typeof window.location?.search !== 'string' ) {
		return false;
	}
	return new URLSearchParams( window.location.search ).get( 'adminSidebarMock' ) === '1';
}
