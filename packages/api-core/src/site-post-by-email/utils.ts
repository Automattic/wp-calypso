import type { SitePostByEmailSettings, SitePostByEmailStatus } from './types';
import type { Site } from '../site/types';

export const POST_BY_EMAIL_ACTIONS = new Set( [
	'',
	'null',
	'create',
	'regenerate',
	'delete',
	'noop',
] );

export function isSimpleWpcomSite( site: Pick< Site, 'jetpack' | 'is_wpcom_atomic' > ) {
	return ! site.jetpack && ! site.is_wpcom_atomic;
}

export function isPostByEmailAddress( value: unknown ): value is string {
	if ( typeof value !== 'string' ) {
		return false;
	}

	const normalizedValue = value.trim().toLowerCase();
	return (
		!! normalizedValue &&
		normalizedValue.includes( '@' ) &&
		! POST_BY_EMAIL_ACTIONS.has( normalizedValue )
	);
}

export function normalizeWpcomPostByEmailStatus(
	status: SitePostByEmailStatus | null | undefined
): SitePostByEmailSettings {
	return {
		post_by_email_address:
			status?.is_enabled && isPostByEmailAddress( status.email ) ? status.email : undefined,
	};
}

export function isPlainObject( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

export function getSettingsFromJetpackResponse( response: unknown ): SitePostByEmailSettings {
	const payload =
		isPlainObject( response ) && isPlainObject( response.data ) ? response.data : response;

	if ( ! isPlainObject( payload ) ) {
		return {};
	}

	const postByEmailAddress = payload.post_by_email_address;

	return {
		post_by_email_address: isPostByEmailAddress( postByEmailAddress )
			? postByEmailAddress
			: undefined,
	};
}
