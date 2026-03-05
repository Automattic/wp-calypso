import { getQueryArg } from '@wordpress/url';

const ALREADY_MEMBER_ERRORS = [ 'already_member', 'already_subscribed' ];
const SOCIAL_LOGIN_QUERY_ARGS = [ 'code', 'service', 'state', 'error' ];

/**
 * Check if an error string indicates the user is already a member
 */
export function isAlreadyMemberError( error: string ): boolean {
	return ALREADY_MEMBER_ERRORS.includes( error );
}

/**
 * Check if the current URL carries social login callback parameters.
 */
export function hasSocialLoginCallbackParams( href: string ): boolean {
	return SOCIAL_LOGIN_QUERY_ARGS.some( ( queryArg ) => Boolean( getQueryArg( href, queryArg ) ) );
}

/**
 * Build a legacy invite path while preserving existing query/hash values.
 */
export function buildLegacyInvitePath(
	siteId: string,
	inviteKey: string,
	optionalKeys: ( string | undefined )[] = [],
	href: string = window.location.href
): string {
	const basePath = `/accept-invite/${ siteId }/${ inviteKey }`;
	const fullPath = optionalKeys
		.filter( Boolean )
		.reduce( ( path, key ) => `${ path }/${ key }`, basePath );

	const currentUrl = new URL( href );
	const query = new URLSearchParams( currentUrl.search );
	query.set( 'legacy', '1' );

	const queryString = query.toString();
	const hash = currentUrl.hash || '';

	return `${ fullPath }${ queryString ? `?${ queryString }` : '' }${ hash }`;
}
