import { useEffect, useMemo } from 'react';
import { useMigrationStickerMutation } from './use-migration-sticker';

const REF_PATHS_WITH_INTRODUCTORY_OFFER = [ 'move-lp' ];

export const useCheckoutMigrationIntroductoryOfferSticker = (
	siteId: number | undefined,
	onSuccessCallback: ( () => void ) | null | undefined
) => {
	const urlQueryParams = new URLSearchParams( window.location.search );
	const refPath = urlQueryParams?.get( 'ref' ) ?? '';
	const checkoutBackPath = urlQueryParams?.get( 'checkoutBackUrl' ) ?? '';

	const {
		addMigrationSticker,
		addMutationRest: {
			isIdle: isMigrationStickerSettingIdle,
			isPending: isMigrationStickerSettingPending,
			isSuccess: isMigrationStickerSettingSuccess,
		},
	} = useMigrationStickerMutation();

	const shouldSetMigrationSticker = useMemo( () => {
		if ( ! siteId ) {
			return false;
		}

		let tempRefPath = refPath;

		if ( ! refPath && checkoutBackPath ) {
			const backUrl = new URL( checkoutBackPath );
			tempRefPath = backUrl.searchParams.get( 'ref' ) ?? '';
		}

		return REF_PATHS_WITH_INTRODUCTORY_OFFER.includes( tempRefPath );
	}, [ refPath, checkoutBackPath, siteId ] );

	useEffect( () => {
		if ( shouldSetMigrationSticker ) {
			addMigrationSticker( siteId! );
		}
	}, [ siteId, addMigrationSticker, shouldSetMigrationSticker ] );

	useEffect( () => {
		if ( shouldSetMigrationSticker && isMigrationStickerSettingSuccess && onSuccessCallback ) {
			setTimeout( onSuccessCallback, 50 );
		}
	}, [ isMigrationStickerSettingSuccess, onSuccessCallback, shouldSetMigrationSticker ] );

	return {
		shouldSetMigrationSticker,
		isLoading: isMigrationStickerSettingPending || isMigrationStickerSettingIdle,
	};
};
