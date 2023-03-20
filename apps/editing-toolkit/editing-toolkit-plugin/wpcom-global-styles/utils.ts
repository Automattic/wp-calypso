import { recordTracksEvent } from '@automattic/calypso-analytics';

export function recordUpgradeNoticeClick( context: string ): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_upgrade_click', {
		context,
	} );
}

export function recordUpgradeNoticeShow( context: string ): void {
	recordTracksEvent( 'calypso_global_styles_gating_notice_show', {
		context,
	} );
}
