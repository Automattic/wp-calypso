import apiFetch from '@wordpress/api-fetch';
import type { WooTicketPlan, WooTicketRequest } from '../human-routing/woo-ticket';

const SUPPORT_FORM_API = '/wccom/support-form';
/** A store can be slow to send its System Status Report. Past this, the ticket goes without it. */
const SSR_TIMEOUT_MS = 25000;

/** Asks the connected store to send WooCommerce.com a fresh System Status Report. */
export async function requestWooSsr( siteId: number ): Promise< void > {
	let timer: ReturnType< typeof setTimeout > | undefined;

	try {
		await Promise.race( [
			apiFetch( { path: `${ SUPPORT_FORM_API }/get-ssr?site-id=${ siteId }` } ),
			new Promise( ( _resolve, reject ) => {
				timer = setTimeout(
					() => reject( new Error( 'The store took too long to reply.' ) ),
					SSR_TIMEOUT_MS
				);
			} ),
		] );
	} finally {
		clearTimeout( timer );
	}
}

/** Creates the ticket through WooCommerce.com's support form endpoint. */
export const createWooTicket = ( request: WooTicketRequest ) =>
	apiFetch( { path: `${ SUPPORT_FORM_API }/create-ticket`, method: 'POST', data: request } );

/**
 * Sends the planned ticket. When it should carry the store's System Status Report, the report is
 * refreshed first, and a failed refresh sends the ticket without it, so the merchant isn't blocked.
 */
export async function sendWooTicket(
	plan: WooTicketPlan
): Promise< { ssrRefreshed: boolean | null } > {
	let request = plan.request;
	let ssrRefreshed: boolean | null = null;

	if ( plan.ssr ) {
		try {
			await requestWooSsr( plan.ssr.siteId );
			ssrRefreshed = true;
		} catch {
			request = plan.ssr.fallback;
			ssrRefreshed = false;
		}
	}

	await createWooTicket( request );

	return { ssrRefreshed };
}

/**
 * The support form's endpoints fail with `wp_send_json_error()`, `{ success: false, data: [ message ] }`,
 * and the REST API itself with a `WP_Error`, `{ code, message }`.
 */
export function getWooTicketErrorMessage( error: unknown ): string | null {
	const { data, message } = ( error ?? {} ) as { data?: unknown; message?: unknown };

	if ( Array.isArray( data ) && typeof data[ 0 ] === 'string' ) {
		return data[ 0 ];
	}

	return typeof message === 'string' ? message : null;
}
