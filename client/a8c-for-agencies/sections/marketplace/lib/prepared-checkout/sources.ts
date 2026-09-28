/**
 * A prepared-checkout source is an external system that can send a signed
 * request to the A4A checkout page. Each source maps to one wpcom endpoint
 * that verifies the request and saves the buyer's `no-site` Store cart.
 *
 * To add a source: register it here and implement its endpoint on wpcom
 * returning the generic prepared-checkout response (see use-prepare-checkout).
 */
export interface PreparedCheckoutSource {
	id: string;
	/** wpcom/v2 path the raw signed params are POSTed to. */
	endpoint: string;
	/** Params that must be present on the URL; the request is rejected client-side otherwise. */
	requiredParams: readonly string[];
	/** Params forwarded only when present, because the signature covers exactly the fields sent. */
	optionalParams: readonly string[];
}

export const PRESSABLE_TITAN_SOURCE_ID = 'pressable_titan';

const SOURCES: Record< string, PreparedCheckoutSource > = {
	[ PRESSABLE_TITAN_SOURCE_ID ]: {
		id: PRESSABLE_TITAN_SOURCE_ID,
		endpoint: '/agency/pressable/titan-checkout',
		requiredParams: [ 'agency_id', 'domain', 'quantity', 'signature' ],
		optionalParams: [ 'plan', 'is_trial' ],
	},
};

export function getPreparedCheckoutSource(
	id: string | null | undefined
): PreparedCheckoutSource | null {
	if ( ! id ) {
		return null;
	}
	return SOURCES[ id ] ?? null;
}
