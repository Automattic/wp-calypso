import { MEMBER_ROLE } from '../../team/constants';
import type { Agency, Site } from '@automattic/api-core';

/**
 * Team members need the agency owner to make them an administrator of a site
 * before they can manage it. Until then they only get the site overview, which
 * explains this. Owners are not restricted here.
 */
export function isTeamMemberWithoutSiteAccess(
	site: Site,
	agency: Agency | null | undefined
): boolean {
	return agency?.user?.role === MEMBER_ROLE && ! site.capabilities?.manage_options;
}
