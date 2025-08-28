import wpcom from 'calypso/lib/wp';

export interface JetpackSettings {
	jetpack_waf_automatic_rules?: boolean;
	jetpack_waf_automatic_rules_last_updated_timestamp?: number;
	jetpack_waf_ip_allow_list_enabled?: boolean;
	jetpack_waf_ip_allow_list?: string;
	jetpack_waf_ip_block_list_enabled?: boolean;
	jetpack_waf_ip_block_list?: string;
	jetpack_sso_match_by_email?: boolean;
	jetpack_sso_require_two_step?: boolean;
}

export async function fetchJetpackSettings(
	siteId: number
): Promise< Partial< JetpackSettings > > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/settings/',
	} );
	return data;
}

export async function updateJetpackSettings(
	siteId: number,
	settings: Partial< JetpackSettings >
) {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/settings/',
		body: JSON.stringify( settings ),
		json: true,
	} );
}
