import { getValidBlogId } from '@automattic/calypso-analytics';

type HelpCenterSiteContext = {
	blogId?: number;
	siteContextSource: 'help_center_context' | 'primary_site';
};

export function getHelpCenterSiteContext(
	siteId: unknown,
	primarySiteId: unknown
): HelpCenterSiteContext {
	const validSiteId = getValidBlogId( siteId );

	return {
		blogId: validSiteId ?? getValidBlogId( primarySiteId ),
		siteContextSource: validSiteId ? 'help_center_context' : 'primary_site',
	};
}
