/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon, info } from '@wordpress/icons';
import debugFactory from 'debug';
import { SetStateAction, useCallback, useState } from 'react';
import proxy from 'wpcom-proxy-request';
/**
 * Internal dependencies
 */
import AiIcon from '../assets/icons/ai';
import { STORE_NAME } from '../store';
import type { SiteDetails } from '@automattic/data-stores';
import './prompt.scss';

const debug = debugFactory( 'jetpack-ai-calypso:prompt-box' );

export const Prompt: React.FC = () => {
	const { addLogoToHistory } = useDispatch( STORE_NAME );
	const [ prompt, setPrompt ] = useState( '' );
	const siteDetails = useSelect( ( select ) => {
		// @ts-expect-error Missing type definition
		return select( STORE_NAME ).getSiteDetails();
	}, [] );

	const onClick = useCallback( async () => {
		debug( 'getting image for prompt', prompt );
		const image = await getImage( { prompt, site: siteDetails } );

		if ( ! image || ! image.data.length ) {
			// TODO: handle unexpected/error response
		}

		// response_format=url returns object with url, otherwise b64_json
		const logo = {
			url: image.data[ 0 ].url,
			description: image.data[ 0 ].revised_prompt,
		};
		addLogoToHistory( logo );
	}, [ siteDetails, addLogoToHistory, prompt ] );

	const onChange = useCallback( ( event: { target: { value: SetStateAction< string > } } ) => {
		setPrompt( event.target.value );
	}, [] );

	return (
		<div className="jetpack-ai-logo-generator__prompt">
			<div className="jetpack-ai-logo-generator__prompt-header">
				<div className="jetpack-ai-logo-generator__prompt-label">Describe your site/logo:</div>
				<div className="jetpack-ai-logo-generator__prompt-actions">
					<Button variant="link">
						<AiIcon />
						Enhance prompt
					</Button>
				</div>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-query">
				{ /* TODO: textarea doesn't resize, either import from block-editor or use custom contentEditable */ }
				<textarea
					className="prompt-query__input"
					placeholder="describe your site or simply ask for a logo specifying some details about it"
					onChange={ onChange }
					value={ prompt }
				></textarea>
				<Button
					variant="primary"
					className="jetpack-ai-logo-generator__prompt-submit"
					onClick={ onClick }
				>
					Generate
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-footer">
				<div>18 requests remaining.</div>&nbsp;
				<a href="https://automattic.com/ai-guidelines">Upgrade</a>
				<Icon className="prompt-footer__icon" icon={ info } />
			</div>
		</div>
	);
};

/*
 * Types & constants
 */
type RequestTokenOptions = {
	apiNonce?: string;
	site?: SiteDetails;
	isJetpackSite?: boolean;
	expirationTime?: number;
};

type TokenDataProps = {
	token: string;
	blogId: string | undefined;
	expire: number;
};

type TokenDataEndpointResponseProps = {
	token: string;
	blog_id: string;
};

const JWT_TOKEN_ID = 'jetpack-ai-jwt';
const JWT_TOKEN_EXPIRATION_TIME = 2 * 60 * 1000; // 2 minutes

async function getImage( { prompt, site }: { prompt: string; site: SiteDetails } ): Promise< any > {
	const tokenData = await requestJwt( { site } );
	const isSimple = ! site?.is_wpcom_atomic;

	if ( ! tokenData || ! tokenData.token ) {
		// TODO: handle error
		return;
	}
	let data;
	if ( ! isSimple ) {
		// TODO: unsure how to handle this
		// data = await proxy( {
		// 	path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
		// 	method: 'GET',
		// 	query: `prompt=${ prompt }&token=${ tokenData.token }&response_format=url`,
		// } );
	} else {
		data = await proxy( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-ai-image',
			method: 'GET',
			query: `prompt=${ prompt }&token=${ tokenData.token }&response_format=url`,
		} );
	}

	return data;
}
/**
 * Request a token from the Jetpack site.
 * @param {RequestTokenOptions} options - Options
 * @returns {Promise<TokenDataProps>}     The token and the blogId
 */
async function requestJwt( {
	site,
	expirationTime,
}: RequestTokenOptions = {} ): Promise< TokenDataProps > {
	// Default values
	// @ts-expect-error meh
	const siteId = site?.ID || window.JP_CONNECTION_INITIAL_STATE.siteSuffix;
	expirationTime = expirationTime || JWT_TOKEN_EXPIRATION_TIME;

	const isSimple = ! site?.is_wpcom_atomic;

	// Trying to pick the token from localStorage
	const token = localStorage.getItem( JWT_TOKEN_ID );
	let tokenData: TokenDataProps | null = null;

	if ( token ) {
		try {
			tokenData = JSON.parse( token );
		} catch ( err ) {
			debug( 'Error parsing token', err );
		}
	}

	if ( tokenData && tokenData?.expire > Date.now() ) {
		debug( 'Using cached token' );
		return tokenData;
	}

	let data: TokenDataEndpointResponseProps;

	if ( ! isSimple ) {
		data = await proxy( {
			path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
			method: 'POST',
		} );
	} else {
		data = await proxy( {
			apiNamespace: 'wpcom/v2',
			path: '/sites/' + siteId + '/jetpack-openai-query/jwt',
			method: 'POST',
		} );
	}

	const newTokenData = {
		token: data.token,
		/**
		 * TODO: make sure we return id from the .com token acquisition endpoint too
		 */
		blogId: ! isSimple ? data.blog_id : siteId,

		/**
		 * Let's expire the token in 2 minutes
		 */
		expire: Date.now() + expirationTime,
	};

	// Store the token in localStorage
	debug( 'Storing new token' );
	localStorage.setItem( JWT_TOKEN_ID, JSON.stringify( newTokenData ) );

	return newTokenData;
}
