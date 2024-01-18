/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import { useCallback } from 'react';
/**
 * Internal dependencies
 */
import { stashLogo } from '../lib/logo-storage';
import { requestJwt } from '../lib/request-token';
import { saveToMediaLibrary } from '../lib/save-to-media-library';
import { setSiteLogo } from '../lib/set-site-logo';
import wpcomLimitedRequest from '../lib/wpcom-limited-request';
import { STORE_NAME } from '../store';
import useRequestErrors from './use-request-errors';
/**
 * Types
 */
import type { Logo, Selectors } from '../store/types';

const debug = debugFactory( 'jetpack-ai-calypso:use-logo-generator' );

const useLogoGenerator = () => {
	const {
		setSelectedLogoIndex,
		setIsSavingLogoToLibrary,
		setIsApplyingLogo,
		setIsRequestingImage,
		setIsEnhancingPrompt,
		increaseAiAssistantRequestsCount,
		addLogoToHistory,
	} = useDispatch( STORE_NAME );

	const {
		logos,
		selectedLogoIndex,
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
			selectedLogoIndex: selectors.getSelectedLogoIndex(),
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

	const {
		setFirstLogoPromptFetchError,
		setEnhancePromptFetchError,
		setLogoFetchError,
		setSaveToLibraryError,
		setLogoUpdateError,
	} = useRequestErrors();

	const { ID = null, name = null, description = null } = siteDetails || {};
	const siteId = ID ? String( ID ) : null;

	const generateFirstPrompt = async function (): Promise< string > {
		setFirstLogoPromptFetchError( null );
		increaseAiAssistantRequestsCount();

		try {
			const tokenData = await requestJwt( { siteDetails } );

			if ( ! tokenData || ! tokenData.token ) {
				throw new Error( 'No token provided' );
			}

			debug( 'Generating first prompt for site', siteId );

			const firstPromptGenerationPrompt = `Generate a simple and short prompt asking for a logo based on the site's name and description, without going into details.
Example for a site named "The minimalist fashion blog", described as "Daily inspiration for all things fashion": A logo for a minimalist fashion site focused on daily sartorial inspiration.

Site name: ${ name }
Site description: ${ description }`;

			const body = {
				question: firstPromptGenerationPrompt,
				feature: 'jetpack-ai-logo-generator',
				stream: false,
			};

			const data = await wpcomLimitedRequest< {
				choices: Array< { message: { content: string } } >;
			} >( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-ai-query',
				method: 'POST',
				token: tokenData.token,
				body,
			} );

			return data?.choices?.[ 0 ]?.message?.content;
		} catch ( error ) {
			increaseAiAssistantRequestsCount( -1 );
			setFirstLogoPromptFetchError( error );
			throw error;
		}
	};

	const enhancePrompt = async function ( { prompt }: { prompt: string } ): Promise< string > {
		setEnhancePromptFetchError( null );
		increaseAiAssistantRequestsCount();

		try {
			const tokenData = await requestJwt( { siteDetails } );

			if ( ! tokenData || ! tokenData.token ) {
				throw new Error( 'No token provided' );
			}

			debug( 'Enhancing prompt', prompt );

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

			const data = await wpcomLimitedRequest< {
				choices: Array< { message: { content: string } } >;
			} >( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-ai-query',
				method: 'POST',
				token: tokenData.token,
				body,
			} );

			return data?.choices?.[ 0 ]?.message?.content;
		} catch ( error ) {
			increaseAiAssistantRequestsCount( -1 );
			setEnhancePromptFetchError( error );
			throw error;
		}
	};

	const generateImage = async function ( {
		prompt,
	}: {
		prompt: string;
	} ): Promise< { data: Array< { url: string } > } > {
		setLogoFetchError( null );

		try {
			const tokenData = await requestJwt( { siteDetails } );
			const isSimple = ! siteDetails.is_wpcom_atomic;

			if ( ! tokenData || ! tokenData.token ) {
				throw new Error( 'No token provided' );
			}

			debug( 'Generating image with prompt', prompt );

			const imageGenerationPrompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS:
Create a text-free vector logo that symbolically represents the user request, using abstract or symbolic imagery.
The design should be modern, with a either a vivid color scheme full of gradients or a color scheme that's monochromatic.
Ensure the logo is set against a clean solid background.
The imagery in the logo should subtly hint at the user request... without using any text, or letters.

User request: ${ prompt }
`;

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
				throw new Error( 'Site type not implemented' );
			} else {
				data = await wpcomLimitedRequest( {
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-ai-image',
					method: 'POST',
					token: tokenData.token,
					body,
				} );
			}

			return data as { data: { url: string }[] };
		} catch ( error ) {
			setLogoFetchError( error );
			throw error;
		}
	};

	const saveLogo = useCallback<
		( logo: Logo ) => Promise< { mediaId: number; mediaURL: string } >
	>(
		async ( logo ) => {
			setSaveToLibraryError( null );

			try {
				if ( ! siteId ) {
					throw new Error( 'Missing siteId or logo' );
				}

				debug( 'Saving logo for site', siteId );

				// If the logo is already saved, return its mediaId and mediaURL.
				if ( logo.mediaId ) {
					return { mediaId: logo.mediaId, mediaURL: logo.url };
				}

				const savedLogo = {
					mediaId: 0,
					mediaURL: '',
				};

				setIsSavingLogoToLibrary( true );

				const { ID: mediaId, URL: mediaURL } = await saveToMediaLibrary( {
					siteId,
					url: logo.url,
					attrs: {
						caption: logo.description,
						description: logo.description,
						title: __( 'Site logo', 'jetpack' ),
						alt: logo.description,
					},
				} );

				savedLogo.mediaId = mediaId;
				savedLogo.mediaURL = mediaURL;

				return savedLogo;
			} catch ( error ) {
				setSaveToLibraryError( error );
				throw error;
			} finally {
				setIsSavingLogoToLibrary( false );
			}
		},
		[ siteId, setIsSavingLogoToLibrary, setSaveToLibraryError ]
	);

	const applyLogo = useCallback( async () => {
		setLogoUpdateError( null );

		try {
			if ( ! siteId || ! selectedLogo ) {
				throw new Error( 'Missing siteId or logo' );
			}

			debug( 'Applying logo for site', siteId );

			setIsApplyingLogo( true );

			const { mediaId } = selectedLogo;

			if ( ! mediaId ) {
				throw new Error( 'Missing mediaId' );
			}

			await setSiteLogo( {
				siteId: siteId,
				imageId: String( mediaId ),
			} );
		} catch ( error ) {
			setLogoUpdateError( error );
			throw error;
		} finally {
			setIsApplyingLogo( false );
		}
	}, [ selectedLogo, setIsApplyingLogo, setLogoUpdateError, siteId ] );

	const storeLogo = useCallback(
		( logo: Logo ) => {
			addLogoToHistory( logo );
			stashLogo( { ...logo, siteId: String( siteId ) } );
		},
		[ siteId, addLogoToHistory ]
	);

	const generateLogo = async function ( { prompt }: { prompt: string } ): Promise< void > {
		debug( 'Generating logo for site', siteId );

		setIsRequestingImage( true );
		increaseAiAssistantRequestsCount();

		try {
			let image;

			try {
				image = await generateImage( { prompt } );

				if ( ! image || ! image.data.length ) {
					throw new Error( 'No image returned' );
				}
			} catch ( error ) {
				increaseAiAssistantRequestsCount( -1 );
				throw error;
			}

			// response_format=url returns object with url, otherwise b64_json
			const logo: Logo = {
				url: image.data[ 0 ].url,
				description: prompt,
			};

			try {
				const savedLogo = await saveLogo( logo );
				storeLogo( {
					url: savedLogo.mediaURL,
					description: prompt,
					mediaId: savedLogo.mediaId,
				} );
			} catch ( error ) {
				storeLogo( logo );
				throw error;
			}
		} finally {
			setIsRequestingImage( false );
		}
	};

	return {
		logos,
		selectedLogoIndex,
		selectedLogo,
		setSelectedLogoIndex,
		site: {
			id: siteId,
			name,
			description,
		},
		generateFirstPrompt,
		saveLogo,
		applyLogo,
		generateImage,
		enhancePrompt,
		storeLogo,
		generateLogo,
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
