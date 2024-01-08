/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import debugFactory from 'debug';
import { useCallback, useEffect, useState, useRef } from 'react';
/**
 * Internal dependencies
 */
import { EVENT_PROMPT_SUBMIT, EVENT_PROMPT_ENHANCE, MINIMUM_PROMPT_LENGTH } from '../../constants';
import AiIcon from '../assets/icons/ai';
import useLogoGenerator from '../hooks/use-logo-generator';
import { STORE_NAME } from '../store';
import './prompt.scss';

const debug = debugFactory( 'jetpack-ai-calypso:prompt-box' );

export const Prompt: React.FC = () => {
	const { addLogoToHistory, increaseAiAssistantRequestsCount } = useDispatch( STORE_NAME );
	const [ prompt, setPrompt ] = useState( '' );
	const [ requestsRemaining, setRequestsRemaining ] = useState( 0 );
	const hasPrompt = prompt?.length >= MINIMUM_PROMPT_LENGTH;

	const {
		generateImage,
		enhancePrompt,
		setIsRequestingImage,
		setIsEnhancingPrompt,
		isBusy,
		isEnhancingPrompt,
		site,
		getAiAssistantFeature,
		requireUpgrade,
	} = useLogoGenerator();

	const enhancingLabel = __( 'Enhancing…', 'jetpack' );
	const enhanceLabel = __( 'Enhance prompt', 'jetpack' );
	const enhanceButtonLabel = isEnhancingPrompt ? enhancingLabel : enhanceLabel;

	const inputRef = useRef< HTMLDivElement | null >( null );

	const onEnhance = useCallback( async () => {
		debug( 'enhancing prompt', prompt );
		setIsEnhancingPrompt( true );
		recordTracksEvent( EVENT_PROMPT_ENHANCE );

		try {
			const enhancedPrompt = await enhancePrompt( { prompt } );
			setPrompt( enhancedPrompt );
			setIsEnhancingPrompt( false );
		} catch ( error ) {
			// TODO: handle error
			debug( 'error enhancing prompt', error );
			setIsEnhancingPrompt( false );
		}
	}, [ enhancePrompt, prompt, setIsEnhancingPrompt ] );

	const featureData = getAiAssistantFeature( String( site?.id || '' ) );

	const currentLimit = featureData?.currentTier?.value || 0;
	const currentUsage = featureData?.usagePeriod?.requestsCount || 0;
	const isUnlimited = currentLimit === 1;

	useEffect( () => {
		setRequestsRemaining( currentLimit - currentUsage );
	}, [ currentLimit, currentUsage ] );

	useEffect( () => {
		// Update prompt after enhancement
		if ( inputRef.current && inputRef.current.textContent !== prompt ) {
			inputRef.current.textContent = prompt;
		}
	}, [ prompt ] );

	const onGenerate = useCallback( async () => {
		debug( 'getting image for prompt', prompt );
		increaseAiAssistantRequestsCount();
		setIsRequestingImage( true );
		recordTracksEvent( EVENT_PROMPT_SUBMIT );
		const image = await generateImage( { prompt } );

		if ( ! image || ! image.data.length ) {
			// TODO: handle unexpected/error response
		}

		// response_format=url returns object with url, otherwise b64_json
		const logo = {
			url: image.data[ 0 ].url,
			description: prompt,
		};
		addLogoToHistory( logo );
		setIsRequestingImage( false );
	}, [
		addLogoToHistory,
		prompt,
		generateImage,
		setIsRequestingImage,
		increaseAiAssistantRequestsCount,
	] );

	const onPromptInput = useCallback( ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setPrompt( event.target.textContent || '' );
	}, [] );

	return (
		<div className="jetpack-ai-logo-generator__prompt">
			<div className="jetpack-ai-logo-generator__prompt-header">
				<div className="jetpack-ai-logo-generator__prompt-label">
					{ __( 'Describe your site:', 'jetpack' ) }
				</div>
				<div className="jetpack-ai-logo-generator__prompt-actions">
					<Button
						variant="link"
						disabled={ isBusy || requireUpgrade || ! hasPrompt }
						onClick={ onEnhance }
					>
						<AiIcon />
						<span>{ enhanceButtonLabel }</span>
					</Button>
				</div>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-query">
				<div
					ref={ inputRef }
					contentEditable={ ! isBusy && ! requireUpgrade }
					// The content editable div is expected to be updated by the enhance prompt, so warnings are suppressed
					suppressContentEditableWarning={ true }
					className="prompt-query__input"
					onInput={ onPromptInput }
					placeholder={ __(
						'Describe your site or simply ask for a logo specifying some details about it',
						'jetpack'
					) }
				></div>
				<Button
					variant="primary"
					className="jetpack-ai-logo-generator__prompt-submit"
					onClick={ onGenerate }
					disabled={ isBusy || requireUpgrade || ! hasPrompt }
				>
					{ __( 'Generate', 'jetpack' ) }
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-footer">
				{ ! isUnlimited && (
					<>
						<div>
							{ sprintf(
								// translators: %u is the number of requests
								__( '%u requests remaining.', 'jetpack' ),
								requestsRemaining
							) }
						</div>
						&nbsp;
						<Button variant="link" href="https://automattic.com/ai-guidelines" target="_blank">
							{ __( 'Upgrade', 'jetpack' ) }
						</Button>
						&nbsp;
						<Icon className="prompt-footer__icon" icon={ info } />
					</>
				) }
			</div>
		</div>
	);
};
