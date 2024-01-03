/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import wpcomProxyRequest from 'wpcom-proxy-request';
/**
 * Internal dependencies
 */
import { requestJwt } from '../lib/request-token';
import { saveToMediaLibrary } from '../lib/save-to-media-library';
import { setSiteLogo } from '../lib/set-site-logo';
import { STORE_NAME } from '../store';
/**
 * Types
 */
import type { Selectors } from '../store/types';

const useLogoGenerator = () => {
	const { setSelectedLogoIndex, updateSelectedLogo, setSavingLogoToLibrary, setIsRequestingImage } =
		useDispatch( STORE_NAME );

	const { logos, selectedLogo, siteDetails, savingLogoToLibrary, isRequestingImage } = useSelect(
		( select ) => {
			const selectors: Selectors = select( STORE_NAME );
			return {
				logos: selectors.getLogos(),
				selectedLogo: selectors.getSelectedLogo(),
				siteDetails: selectors.getSiteDetails(),
				savingLogoToLibrary: selectors.getSavingLogoToLibrary(),
				isRequestingImage: selectors.getIsRequestingImage(),
			};
		},
		[]
	);

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

	const generateImage = async function ( { prompt }: { prompt: string } ): Promise< any > {
		const tokenData = await requestJwt( { siteDetails } );
		const isSimple = ! siteDetails.is_wpcom_atomic;

		if ( ! tokenData || ! tokenData.token ) {
			// TODO: handle error
			return;
		}
		let data;
		const params = {
			prompt,
			token: tokenData.token,
			response_format: 'url',
		};
		if ( ! isSimple ) {
			// TODO: unsure how to handle this
			// data = await proxy( {
			// 	path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
			// 	method: 'GET',
			// 	query: `prompt=${ prompt }&token=${ tokenData.token }&response_format=url`,
			// } );
		} else {
			data = await wpcomProxyRequest( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-ai-image',
				method: 'GET',
				query: new URLSearchParams( params ).toString(),
			} );
		}

		return data;
	};

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
		generateImage,
		setIsRequestingImage,
		isRequestingImage,
	};
};

export default useLogoGenerator;
