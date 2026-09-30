import { wpcom } from './wpcom-fetcher';

/**
 * VGS's own name for the vault's region. Mirrors `VGSCollectVaultEnvironment`
 * from `@vgs/collect-js-react`, which this package does not depend on.
 */
export type VgsVaultEnvironment = 'sandbox' | 'live' | 'live-eu-1' | 'live-ap-1';

/**
 * Identifies the VGS Collect vault that card fields are tokenized against.
 */
export interface VgsVaultId {
	vault_id: string;
	environment: VgsVaultEnvironment;
}

export async function fetchVgsVaultId(): Promise< VgsVaultId > {
	return await wpcom.req.get( {
		path: '/transact/vgs/wpcom/vault-id',
		apiNamespace: 'wpcom/v2',
	} );
}

export interface EbanxVgsTokenizeRequest {
	/** VGS alias for the card number. */
	card_number: string;
	/** Plain-text cardholder name; VGS does not tokenize it. */
	card_name: string;
	/** VGS alias for the expiry date (MM/YY). */
	card_due_date: string;
	/** VGS alias for the CVV. */
	card_cvv: string;
	/** What the token will be used for, e.g. `new_purchase` or `add_card`. */
	payment_type_code: string;
	country: string;
	test_mode?: boolean;
}

export interface EbanxVgsTokenizeResponse {
	token: string;
	payment_type_code?: string;
	status?: string;
}

/**
 * Exchanges VGS card aliases for an EBANX payment token, server-side.
 */
export async function tokenizeEbanxCardWithVgs(
	body: EbanxVgsTokenizeRequest
): Promise< EbanxVgsTokenizeResponse > {
	return await wpcom.req.post( {
		path: '/transact/vgs/wpcom/ebanx/tokenize',
		apiNamespace: 'wpcom/v2',
		body,
	} );
}
