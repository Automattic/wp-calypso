/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import debugFactory from 'debug';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
/**
 * Internal dependencies
 */
import { EVENT_PROMPT_SUBMIT, EVENT_PROMPT_ENHANCE } from '../../constants';
import AiIcon from '../assets/icons/ai';
import useLogoGenerator from '../hooks/use-logo-generator';
import { STORE_NAME } from '../store';
import './prompt.scss';

const debug = debugFactory( 'jetpack-ai-calypso:prompt-box' );

export const Prompt: React.FC = () => {
	const { addLogoToHistory, increaseAiAssistantRequestsCount } = useDispatch( STORE_NAME );
	const [ prompt, setPrompt ] = useState( '' );
	const [ requestsRemaining, setRequestsRemaining ] = useState( 0 );

	const {
		generateImage,
		enhancePrompt,
		setIsRequestingImage,
		setIsEnhancingPrompt,
		isBusy,
		isEnhancingPrompt,
		site,
		getAiAssistantFeature,
	} = useLogoGenerator();

	const enhancingLabel = __( 'Enhancing…', 'jetpack' );
	const enhanceLabel = __( 'Enhance prompt', 'jetpack' );
	const enhanceButtonLabel = isEnhancingPrompt ? enhancingLabel : enhanceLabel;

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

	const isFreeTier = featureData?.currentTier?.value === 0;
	const currentLimit = featureData?.currentTier?.value || 0;
	const currentUsage = featureData?.usagePeriod?.requestsCount || 0;
	const isUnlimited = currentLimit === 1;

	useEffect( () => {
		setRequestsRemaining( currentLimit - currentUsage );
	}, [ currentLimit, currentUsage ] );

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

	const onChange = useCallback( ( event: { target: { value: SetStateAction< string > } } ) => {
		setPrompt( event.target.value );
	}, [] );

	const freeUsage = sprintf(
		// translators: %u is the number of requests
		__( '%u free requests remaining.', 'jetpack' ),
		requestsRemaining
	);
	const tieredUsage = sprintf(
		// translators: %u is the number of requests
		__( '%u requests remaining.', 'jetpack' ),
		requestsRemaining
	);

	return (
		<div className="jetpack-ai-logo-generator__prompt">
			<div className="jetpack-ai-logo-generator__prompt-header">
				<div className="jetpack-ai-logo-generator__prompt-label">
					{ __( 'Describe your site:', 'jetpack' ) }
				</div>
				<div className="jetpack-ai-logo-generator__prompt-actions">
					<Button variant="link" disabled={ isBusy } onClick={ onEnhance }>
						<AiIcon />
						<span>{ enhanceButtonLabel }</span>
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
					disabled={ isBusy }
				></textarea>
				<Button
					variant="primary"
					className="jetpack-ai-logo-generator__prompt-submit"
					onClick={ onGenerate }
					disabled={ isBusy }
				>
					{ __( 'Generate', 'jetpack' ) }
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-footer">
				{ ! isUnlimited && (
					<>
						<div>{ isFreeTier ? freeUsage : tieredUsage }</div>
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
