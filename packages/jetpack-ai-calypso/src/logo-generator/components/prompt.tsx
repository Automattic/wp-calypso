/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
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

	const {
		generateImage,
		setIsRequestingImage,
		isRequestingImage,
		savingLogoToLibrary,
		applyingLogo,
	} = useLogoGenerator();

	const isLoading = isRequestingImage || savingLogoToLibrary || applyingLogo;

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
				<div className="jetpack-ai-logo-generator__prompt-label">
					{ __( 'Describe your site:', 'jetpack' ) }
				</div>
				<div className="jetpack-ai-logo-generator__prompt-actions">
					<Button variant="link" disabled={ isLoading }>
						<AiIcon />
						<span>{ __( 'Enhance prompt', 'jetpack' ) }</span>
					</Button>
				</div>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-query">
				{ /* TODO: textarea doesn't resize, either import from block-editor or use custom contentEditable */ }
				<textarea
					className="prompt-query__input"
					placeholder={ __(
						'Describe your site or simply ask for a logo specifying some details about it',
						'jetpack'
					) }
					onChange={ onChange }
					value={ prompt }
					disabled={ isLoading }
				></textarea>
				<Button
					variant="primary"
					className="jetpack-ai-logo-generator__prompt-submit"
					onClick={ onClick }
					disabled={ isLoading }
				>
					{ __( 'Generate', 'jetpack' ) }
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-footer">
				<div>
					{ sprintf(
						// translators: %u is the number of requests
						__( '%u requests remaining.', 'jetpack' ),
						18
					) }
				</div>
				&nbsp;
				<Button variant="link" href="https://automattic.com/ai-guidelines" target="_blank">
					{ __( 'Upgrade', 'jetpack' ) }
				</Button>
				<Icon className="prompt-footer__icon" icon={ info } />
			</div>
		</div>
	);
};
