import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelect } from '@wordpress/data';

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

export function useGlobalStylesConfig() {
	return useSelect( ( select ) => {
		const {
			getEditedEntityRecord,
			__experimentalGetCurrentGlobalStylesId,
			__experimentalGetDirtyEntityRecords,
		} = select( 'core' );

		const _globalStylesId = __experimentalGetCurrentGlobalStylesId
			? __experimentalGetCurrentGlobalStylesId()
			: null;
		const globalStylesRecord = getEditedEntityRecord( 'root', 'globalStyles', _globalStylesId );

		const globalStylesConfig = {
			styles: globalStylesRecord?.styles ?? {},
			settings: globalStylesRecord?.settings ?? {},
		};

		// Do not show the notice if the use is trying to save the default styles.
		const isVisible =
			Object.keys( globalStylesConfig.styles ).length ||
			Object.keys( globalStylesConfig.settings ).length;

		return {
			globalStylesConfig,
			isVisible,
			siteChanges: __experimentalGetDirtyEntityRecords ? __experimentalGetDirtyEntityRecords() : [],
		};
	}, [] );
}
