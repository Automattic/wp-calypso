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
	const { setSelectedLogoIndex } = useDispatch( STORE_NAME );

	const { logos, selectedLogo, siteDetails } = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return {
			logos: selectors.getLogos(),
			selectedLogo: selectors.getSelectedLogo(),
			siteDetails: selectors.getSiteDetails(),
		};
	}, [] );
	const { ID = null, name = null, description = null } = siteDetails;
	const siteId = String( ID );

	const saveLogo = useCallback( async () => {
		if ( ! selectedLogo || selectedLogo.mediaId ) {
			return;
		}

		try {
			const { ID, URL } = await saveToMediaLibrary( {
				siteId,
				url: selectedLogo.url,
				attrs: {
					caption: selectedLogo.description,
					description: selectedLogo.description,
					title: __( 'Site logo', 'jetpack' ),
					alt: selectedLogo.description,
				},
			} );

			selectedLogo.mediaId = ID;
			selectedLogo.url = URL;
		} catch ( error ) {
			// TODO: Handle error when saving to media library fails.
		}
	}, [ selectedLogo, siteId ] );

	const applyLogo = useCallback( async () => {
		if ( ! selectedLogo ) {
			return;
		}

		await saveLogo();

		if ( ! selectedLogo.mediaId ) {
			return;
		}

		try {
			setSiteLogo( {
				siteId: siteId,
				imageId: selectedLogo.mediaId as string,
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
	};
};

export default useLogoGenerator;
