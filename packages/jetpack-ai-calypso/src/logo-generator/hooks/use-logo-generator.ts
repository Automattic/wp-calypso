/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
/**
 * Internal dependencies
 */
import { saveToMediaLibrary } from '../lib/save-to-media-library';
import { setSiteLogo } from '../lib/set-site-logo';
import { STORE_NAME } from '../store';
/**
 * Types
 */
import type { Selectors } from '../store/types';

const useLogoGenerator = () => {
	const { setSelectedLogoIndex, updateSelectedLogo, setSavingLogoToLibrary } =
		useDispatch( STORE_NAME );

	const { logos, selectedLogo, siteDetails, savingLogoToLibrary } = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return {
			logos: selectors.getLogos(),
			selectedLogo: selectors.getSelectedLogo(),
			siteDetails: selectors.getSiteDetails(),
			savingLogoToLibrary: selectors.getSavingLogoToLibrary(),
		};
	}, [] );

	const { ID = null, name = null, description = null } = siteDetails;
	const siteId = ID ? String( ID ) : null;

	const saveLogo = useCallback<
		() => Promise< { mediaId: number; mediaURL: string } >
	>( async () => {
		if ( ! siteId || ! selectedLogo ) {
			throw new Error( 'Missing siteId or logo' );
		}

		// If the logo is already saved, return its mediaId and mediaURL.
		if ( selectedLogo.mediaId ) {
			return { mediaId: selectedLogo.mediaId, mediaURL: selectedLogo.url };
		}

		// eslint-disable-next-line no-useless-catch
		try {
			const { ID: mediaId, URL: mediaURL } = await saveToMediaLibrary( {
				siteId,
				url: selectedLogo.url,
				attrs: {
					caption: selectedLogo.description,
					description: selectedLogo.description,
					title: __( 'Site logo', 'jetpack' ),
					alt: selectedLogo.description,
				},
			} );

			updateSelectedLogo( mediaId, mediaURL );

			return { mediaId, mediaURL };
		} catch ( error ) {
			// TODO: Handle error when saving to media library fails.
			throw error;
		}
	}, [ updateSelectedLogo, selectedLogo, siteId ] );

	const applyLogo = useCallback( async () => {
		if ( ! siteId || ! selectedLogo ) {
			throw new Error( 'Missing siteId or logo' );
		}

		try {
			const { mediaId } = await saveLogo();

			setSiteLogo( {
				siteId: siteId,
				imageId: mediaId,
			} );
		} catch ( error ) {
			// TODO: Handle error when setting site logo fails.
		}
	}, [ saveLogo, selectedLogo, siteId ] );

	return {
		setSelectedLogoIndex,
		logos,
		selectedLogo,
		site: {
			id: siteId,
			name,
			description,
		},
		saveLogo,
		applyLogo,
		setSavingLogoToLibrary,
		savingLogoToLibrary,
	};
};

export default useLogoGenerator;
