import { isAutomatticianQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';

/**
 * Audience properties for the calypso_dashboard_mcp_* Tracks events.
 *
 * Mirrors TracksPropsHelper::audience_props() in wpcom (AIINT-586) so the
 * properties mean the same thing across the wpcom, Calypso, and Jetpack
 * families:
 *
 * - is_a11n is identity, not access — the user is an Automattician (a8c team
 * membership), regardless of the MCP allowlist.
 * - is_test is environment only — a non-production build (development, stage,
 * wpcalypso, horizon). The bundle cannot see the proxied/sandboxed request
 * state the PHP helper reads, so proxied production traffic reads 'false'
 * here; the two properties stay disjoint either way.
 *
 * Both are the strings 'true'/'false', per the AIINT-576 encoding cutover.
 * @returns {{ is_a11n: 'true'|'false', is_test: 'true'|'false' }}
 */
export function useMcpTracksAudienceProps() {
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	return {
		is_a11n: isAutomattician === true ? 'true' : 'false',
		is_test: /(^|-)production$/.test( config( 'env_id' ) ) ? 'false' : 'true',
	};
}
