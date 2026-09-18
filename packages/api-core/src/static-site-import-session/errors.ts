export type StaticSiteImportErrorCode =
	| 'static_site_import_disabled'
	| 'invalid_static_site_source_url'
	| 'static_site_import_session_limit_exceeded'
	| 'static_site_import_session_not_found'
	| 'static_site_import_preview_expired'
	| 'static_site_import_session_already_approved'
	| 'static_site_import_session_conflict'
	| 'static_site_import_blocked'
	| 'unauthorized';

/** The `code` of a wpcom REST error (`error` on wpcom.js errors), or undefined. */
export function getStaticSiteImportErrorCode( error: unknown ): string | undefined {
	if ( ! error || typeof error !== 'object' ) {
		return undefined;
	}
	const { error: code, code: altCode } = error as { error?: unknown; code?: unknown };
	if ( typeof code === 'string' ) {
		return code;
	}
	return typeof altCode === 'string' ? altCode : undefined;
}

export function isStaticSiteImportError(
	error: unknown,
	code: StaticSiteImportErrorCode
): boolean {
	return getStaticSiteImportErrorCode( error ) === code;
}
