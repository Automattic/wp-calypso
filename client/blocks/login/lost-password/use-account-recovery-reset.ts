/**
 * Data layer for the logged-out account-recovery password reset flow.
 *
 * Wraps the public `wpcom/v2/account-recovery/*` REST endpoints as plain
 * promise-returning functions. By design this uses direct `wp.req` calls with
 * no Redux: the flow is logged-out and ephemeral, so the calling components own
 * their loading/error/step state.
 */

import { useMemo } from 'react';
import wp from 'calypso/lib/wp';

const API_NAMESPACE = 'wpcom/v2';

/**
 * Identifies the locked-out user. Provide EITHER `user` (login or email) OR the
 * firstname/lastname/url triple — never both, or the API responds with a 400.
 */
export type AccountRecoveryUserData =
	| { user: string }
	| { firstname: string; lastname: string; url: string };

/** Verification methods accepted by `request-reset` / `validate` / `reset`. */
export type AccountRecoveryMethod =
	| 'primary_email'
	| 'secondary_email'
	| 'primary_sms'
	| 'secondary_sms'
	| 'authenticator_app'
	| 'transactionid'
	| 'activation_key';

/** The subset of methods `lookup` can report an obscured hint for. */
export type AccountRecoveryLookupMethod =
	| 'primary_email'
	| 'secondary_email'
	| 'primary_sms'
	| 'secondary_sms';

/**
 * Configured methods for the resolved user, keyed by method and valued by the
 * backend's obscured hint (e.g. `j****e@gmail.com`). Only methods that are
 * actually configured are present; unconfigured ones are omitted.
 */
export type AccountRecoveryAvailableMethods = Partial<
	Record< AccountRecoveryLookupMethod, string >
>;

interface RequestResetArgs {
	userData: AccountRecoveryUserData;
	method: AccountRecoveryMethod;
	/** The current TOTP code; required (and verified inline) for `authenticator_app`. */
	appCode?: string;
}

interface ValidateArgs {
	userData: AccountRecoveryUserData;
	method: AccountRecoveryMethod;
	/** The code received via SMS/email. */
	key: string;
}

interface ResetArgs extends ValidateArgs {
	password: string;
}

const LOOKUP_METHODS: AccountRecoveryLookupMethod[] = [
	'primary_email',
	'secondary_email',
	'primary_sms',
	'secondary_sms',
];

/** The endpoint returns obscured hints; treat empty/whitespace-only as "not configured". */
function hasHint( value: unknown ): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * GET the methods available to the resolved user, filtered to those actually
 * configured. The endpoint currently returns keys even for unset methods
 * (an obscured empty string) and does not yet filter to validated methods —
 * both are being tightened backend-side, so we drop empty hints here too.
 */
export async function lookup(
	userData: AccountRecoveryUserData
): Promise< AccountRecoveryAvailableMethods > {
	const response = ( await wp.req.get(
		{ path: '/account-recovery/lookup', apiNamespace: API_NAMESPACE },
		userData
	) ) as Partial< Record< AccountRecoveryLookupMethod, string > >;

	return LOOKUP_METHODS.reduce< AccountRecoveryAvailableMethods >( ( available, method ) => {
		const hint = response?.[ method ];
		if ( hasHint( hint ) ) {
			available[ method ] = hint;
		}
		return available;
	}, {} );
}

/**
 * POST to send a reset code/link via the chosen method. For `authenticator_app`
 * the TOTP `appCode` is verified inline, so this call IS the verification step.
 */
export async function requestReset( {
	userData,
	method,
	appCode,
}: RequestResetArgs ): Promise< void > {
	const body: Record< string, unknown > = { ...userData, method };
	if ( method === 'authenticator_app' && appCode !== undefined ) {
		body[ 'app-code' ] = appCode;
	}
	await wp.req.post(
		{ path: '/account-recovery/request-reset', apiNamespace: API_NAMESPACE },
		{},
		body
	);
}

/** POST to check a code before showing the set-new-password screen. */
export async function validate( { userData, method, key }: ValidateArgs ): Promise< void > {
	await wp.req.post(
		{ path: '/account-recovery/validate', apiNamespace: API_NAMESPACE },
		{},
		{ ...userData, method, key }
	);
}

/** POST to set the new password (the backend re-validates the key). */
export async function reset( { userData, method, key, password }: ResetArgs ): Promise< void > {
	await wp.req.post(
		{ path: '/account-recovery/reset', apiNamespace: API_NAMESPACE },
		{},
		{ ...userData, method, key, password }
	);
}

/**
 * Exposes the four account-recovery reset calls as a stable object. Stateless
 * by design (no Redux); callers manage their own loading/error/step state.
 */
export function useAccountRecoveryReset() {
	return useMemo( () => ( { lookup, requestReset, validate, reset } ), [] );
}
