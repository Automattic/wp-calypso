import { recordTracksEvent } from '@automattic/calypso-analytics';

declare const wpcomGlobalStyles: { upgradeUrl: string; wpcomBlogId: string | null };

/**
 * Record an event when a user clicks on the notice.
 */
export function recordUpgradeNoticeClick( context: string | undefined ): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_upgrade_click', {
		context,
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );
}

/**
 * Record an event when the GS upgrade notice is shown.
 */
export function recordUpgradeNoticeShow( context: string | undefined ): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_show', {
		context,
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );
}
