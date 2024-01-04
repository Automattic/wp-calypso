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
	const {
		setSelectedLogoIndex,
		updateSelectedLogo,
		setIsSavingLogoToLibrary,
		setIsApplyingLogo,
		setIsRequestingImage,
		setIsEnhancingPrompt,
	} = useDispatch( STORE_NAME );

	const {
		logos,
		selectedLogo,
		siteDetails,
		isSavingLogoToLibrary,
		isApplyingLogo,
		isEnhancingPrompt,
		isBusy,
		isRequestingImage,
		getAiAssistantFeature,
		requireUpgrade,
	} = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return {
			logos: selectors.getLogos(),
			selectedLogo: selectors.getSelectedLogo(),
			siteDetails: selectors.getSiteDetails(),
			isSavingLogoToLibrary: selectors.getIsSavingLogoToLibrary(),
			isApplyingLogo: selectors.getIsApplyingLogo(),
			isRequestingImage: selectors.getIsRequestingImage(),
			isEnhancingPrompt: selectors.getIsEnhancingPrompt(),
			isBusy: selectors.getIsBusy(),
			getAiAssistantFeature: selectors.getAiAssistantFeature,
			requireUpgrade: selectors.getRequireUpgrade(),
		};
	}, [] );

	const { ID = null, name = null, description = null } = siteDetails || {};
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
			setIsSavingLogoToLibrary( true );

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
			setIsSavingLogoToLibrary( false );

			return { mediaId, mediaURL };
		} catch ( error ) {
			// TODO: Handle error when saving to media library fails.
			setIsSavingLogoToLibrary( false );
			throw error;
		}
	}, [ siteId, selectedLogo, setIsSavingLogoToLibrary, updateSelectedLogo ] );

	const applyLogo = useCallback( async () => {
		if ( ! siteId || ! selectedLogo ) {
			throw new Error( 'Missing siteId or logo' );
		}

		try {
			const { mediaId } = await saveLogo();

			setIsApplyingLogo( true );

			await setSiteLogo( {
				siteId: siteId,
				imageId: mediaId,
			} );

			setIsApplyingLogo( false );
		} catch ( error ) {
			// TODO: Handle error when setting site logo fails.
			setIsApplyingLogo( false );
			throw error;
		}
	}, [ saveLogo, selectedLogo, setIsApplyingLogo, siteId ] );

	const generateImage = async function ( { prompt }: { prompt: string } ): Promise< any > {
		const tokenData = await requestJwt( { siteDetails } );
		const isSimple = ! siteDetails.is_wpcom_atomic;

		const imageGenerationPrompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS:
Create a text-free vector logo that symbolically represents the user request, using abstract or symbolic imagery.
The design should be modern, with a either a vivid color scheme full of gradients or a color scheme that's monochromatic.
Ensure the logo is set against a clean solid background.
The imagery in the logo should subtly hint at the user request... without using any text, or letters.

User request: ${ prompt }
`;

		if ( ! tokenData || ! tokenData.token ) {
			// TODO: handle error
			return;
		}
		let data;
		const body = {
			prompt: imageGenerationPrompt,
			feature: 'jetpack-ai-logo-generator',
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
				method: 'POST',
				token: tokenData.token,
				body,
			} );
		}

		return data;
	};

	const enhancePrompt = async function ( { prompt }: { prompt: string } ): Promise< string > {
		const tokenData = await requestJwt( { siteDetails } );

		if ( ! tokenData || ! tokenData.token ) {
			// TODO: handle error
			throw new Error( 'No token provided' );
		}

		const systemMessage = `Enhance the prompt you receive.
The prompt is meant for generating a logo. Return the same prompt enhanced, and make each enhancement wrapped in brackets.
For example: user's prompt: A logo for an ice cream shop. Returned prompt: A logo for an ice cream shop [that is pink] [and vibrant].`;

		const messages = [
			{
				role: 'system',
				content: systemMessage,
			},
			{
				role: 'user',
				content: prompt,
			},
		];

		const body = {
			messages,
			feature: 'jetpack-ai-logo-generator',
			stream: false,
		};

		const data = await wpcomProxyRequest< { choices: Array< { message: { content: string } } > } >(
			{
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-ai-query',
				method: 'POST',
				token: tokenData.token,
				body,
			}
		);

		return data?.choices?.[ 0 ]?.message?.content;
	};

	return {
		logos,
		selectedLogo,
		setSelectedLogoIndex,
		site: {
			id: siteId,
			name,
			description,
		},
		saveLogo,
		applyLogo,
		generateImage,
		enhancePrompt,
		setIsEnhancingPrompt,
		setIsRequestingImage,
		setIsSavingLogoToLibrary,
		setIsApplyingLogo,
		isEnhancingPrompt,
		isRequestingImage,
		isSavingLogoToLibrary,
		isApplyingLogo,
		isBusy,
		getAiAssistantFeature,
		requireUpgrade,
	};
};

export default useLogoGenerator;
