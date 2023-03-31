import { recordTracksEvent } from '@automattic/calypso-analytics';

declare const wpcomGlobalStyles: { upgradeUrl: string; wpcomBlogId: string | null };

/**
 * Record an event when a user clicks on the notice from the pre-save panel.
 */
export function recordUpgradePreSaveNoticeClick(): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_upgrade_click', {
		context: 'site-editor',
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );
}

/**
 * Record an event when a user clicks on the notice from the Global Styles sidebar.
 */
export function recordUpgradeSidebarNoticeClick(): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_sidebar_upgrade_click', {
		context: 'site-editor',
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );
}

/**
 * Record an event when the GS upgrade notice is shown in the pre-save screen.
 */
export function recordUpgradeNoticePreSaveShow(): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_show', {
		context: 'site-editor',
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );
}

/**
 * Record an event when the GS upgrade notice is shown in the Global Styles sidebar.
 */
export function recordUpgradeNoticeSidebarShow(): void {
	recordTracksEvent( 'calypso_global_styles_gating_sidebar_notice_show', {
		context: 'site-editor',
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );
}
