/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { Icon, info } from '@wordpress/icons';
import debugFactory from 'debug';
import { SetStateAction, useCallback, useState } from 'react';
/**
 * Internal dependencies
 */
import { EVENT_PROMPT_SUBMIT } from '../../constants';
import AiIcon from '../assets/icons/ai';
import useLogoGenerator from '../hooks/use-logo-generator';
import { STORE_NAME } from '../store';
import './prompt.scss';

const debug = debugFactory( 'jetpack-ai-calypso:prompt-box' );

export const Prompt: React.FC = () => {
	const { addLogoToHistory } = useDispatch( STORE_NAME );
	const [ prompt, setPrompt ] = useState( '' );

	const { generateImage, setIsRequestingImage, isRequestingImage } = useLogoGenerator();

	const onClick = useCallback( async () => {
		debug( 'getting image for prompt', prompt );
		setIsRequestingImage( true );
		recordTracksEvent( EVENT_PROMPT_SUBMIT );
		const image = await generateImage( { prompt } );

		if ( ! image || ! image.data.length ) {
			// TODO: handle unexpected/error response
		}

		// response_format=url returns object with url, otherwise b64_json
		const logo = {
			url: image.data[ 0 ].url,
			description: image.data[ 0 ].revised_prompt,
		};
		addLogoToHistory( logo );
		setIsRequestingImage( false );
	}, [ addLogoToHistory, prompt, generateImage, setIsRequestingImage ] );

	const onChange = useCallback( ( event: { target: { value: SetStateAction< string > } } ) => {
		setPrompt( event.target.value );
	}, [] );

	return (
		<div className="jetpack-ai-logo-generator__prompt">
			<div className="jetpack-ai-logo-generator__prompt-header">
				<div className="jetpack-ai-logo-generator__prompt-label">Describe your site/logo:</div>
				<div className="jetpack-ai-logo-generator__prompt-actions">
					<Button variant="link" disabled={ isRequestingImage }>
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
					disabled={ isRequestingImage }
				></textarea>
				<Button
					variant="primary"
					className="jetpack-ai-logo-generator__prompt-submit"
					onClick={ onClick }
					disabled={ isRequestingImage }
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
