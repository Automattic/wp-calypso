import config from '@automattic/calypso-config';

/**
 * The Site Spec step (CIAB mode) re-enters the AI Site Builder flow with `create_garden_site` /
 * `early_created_site` to finish provisioning a garden site. That path must always use the legacy
 * free flow, so it is excluded from the paid-only flow.
 */
export function isCiabReentry( params: URLSearchParams ): boolean {
	return params.has( 'create_garden_site' ) || params.has( 'early_created_site' );
}

/**
 * Whether this request should use the paid-only checkout flow rather than the legacy free flow.
 */
export function isPaidOnlyEntry( params: URLSearchParams ): boolean {
	return config.isEnabled( 'onboarding/ai-site-builder-paid-only' ) && ! isCiabReentry( params );
}
