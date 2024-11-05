import { useEffect, useMemo } from 'react';
import { useMigrationIntroductoryOfferMutation } from 'calypso/data/site-migration/landing/use-introductory-offer-mutation';

const REF_PATHS_WITH_INTRODUCTORY_OFFER = [ 'move-lp', 'logged-out-homepage-lp' ];

export const useCheckoutMigrationIntroductoryOfferSticker = (
	siteId: number | undefined,
	onSuccessCallback: ( () => void ) | null | undefined
) => {
	const urlQueryParams = new URLSearchParams( window.location.search );
	const refPath = urlQueryParams?.get( 'ref' ) ?? '';
	const checkoutBackPath = urlQueryParams?.get( 'checkoutBackUrl' ) ?? '';
	const introductoryOffer = urlQueryParams?.get( 'introductoryOffer' ) ?? '';

	const {
		addMigrationSticker,
		addMutationRest: {
			isIdle: isMigrationStickerSettingIdle,
			isPending: isMigrationStickerSettingPending,
			isSuccess: isMigrationStickerSettingSuccess,
		},
	} = useMigrationIntroductoryOfferMutation();

	const shouldSetMigrationSticker = useMemo( () => {
		if ( ! siteId ) {
			return false;
		}

		if ( introductoryOffer ) {
			return true;
		}

		let tempRefPath = refPath;

		if ( ! refPath && checkoutBackPath ) {
			const backUrl = new URL( checkoutBackPath );
			tempRefPath = backUrl.searchParams.get( 'ref' ) ?? '';
		}

		return REF_PATHS_WITH_INTRODUCTORY_OFFER.some( ( path ) => tempRefPath.includes( path ) );
	}, [ introductoryOffer, refPath, checkoutBackPath, siteId ] );

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
