/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Tooltip } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import debugFactory from 'debug';
import { useCallback, useEffect, useState, useRef } from 'react';
/**
 * Internal dependencies
 */
import {
	EVENT_PROMPT_ENHANCE,
	EVENT_GENERATE,
	MINIMUM_PROMPT_LENGTH,
	EVENT_UPGRADE,
	EVENT_PLACEMENT_INPUT_FOOTER,
} from '../../constants';
import AiIcon from '../assets/icons/ai';
import useLogoGenerator from '../hooks/use-logo-generator';
import useRequestErrors from '../hooks/use-request-errors';
import { UpgradeNudge } from './upgrade-nudge';
import './prompt.scss';

const debug = debugFactory( 'jetpack-ai-calypso:prompt-box' );

export const Prompt: React.FC< { initialPrompt?: string } > = ( { initialPrompt = '' } ) => {
	const [ prompt, setPrompt ] = useState< string >( initialPrompt );
	const [ requestsRemaining, setRequestsRemaining ] = useState( 0 );
	const { enhancePromptFetchError, logoFetchError } = useRequestErrors();
	const hasPrompt = prompt?.length >= MINIMUM_PROMPT_LENGTH;

	const {
		generateLogo,
		enhancePrompt,
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
		debug( 'Enhancing prompt', prompt );
		setIsEnhancingPrompt( true );
		recordTracksEvent( EVENT_PROMPT_ENHANCE );

		try {
			const enhancedPrompt = await enhancePrompt( { prompt } );
			setPrompt( enhancedPrompt );
			setIsEnhancingPrompt( false );
		} catch ( error ) {
			debug( 'Error enhancing prompt', error );
			setIsEnhancingPrompt( false );
		}
	}, [ enhancePrompt, prompt, setIsEnhancingPrompt ] );

	const featureData = getAiAssistantFeature( String( site?.id || '' ) );

	const currentLimit = featureData?.currentTier?.value || 0;
	const currentUsage = featureData?.usagePeriod?.requestsCount || 0;
	const isUnlimited = currentLimit === 1;

	useEffect( () => {
		if ( currentLimit - currentUsage <= 0 ) {
			setRequestsRemaining( 0 );
		} else {
			setRequestsRemaining( currentLimit - currentUsage );
		}
	}, [ currentLimit, currentUsage ] );

	useEffect( () => {
		// Update prompt text node after enhancement
		if ( inputRef.current && inputRef.current.textContent !== prompt ) {
			inputRef.current.textContent = prompt;
		}
	}, [ prompt ] );

	const onGenerate = useCallback( async () => {
		recordTracksEvent( EVENT_GENERATE );
		generateLogo( { prompt } );
	}, [ generateLogo, prompt ] );

	const onPromptInput = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setPrompt( event.target.textContent || '' );
	};

	const onPromptPaste = ( event: React.ClipboardEvent< HTMLInputElement > ) => {
		event.preventDefault();

		// Paste plain text only
		const text = event.clipboardData.getData( 'text/plain' );

		const selection = window.getSelection();
		if ( ! selection || ! selection.rangeCount ) {
			return;
		}
		selection.deleteFromDocument();
		const range = selection.getRangeAt( 0 );
		range.insertNode( document.createTextNode( text ) );
		selection.collapseToEnd();

		setPrompt( inputRef.current?.textContent || '' );
	};

	const onUpgradeClick = () => {
		recordTracksEvent( EVENT_UPGRADE, { placement: EVENT_PLACEMENT_INPUT_FOOTER } );
	};

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
					onPaste={ onPromptPaste }
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
				{ ! isUnlimited && ! requireUpgrade && (
					<div className="jetpack-ai-logo-generator__prompt-requests">
						<div>
							{ sprintf(
								// translators: %u is the number of requests
								__( '%u requests remaining.', 'jetpack' ),
								requestsRemaining
							) }
						</div>
						&nbsp;
						<Button
							variant="link"
							href="https://automattic.com/ai-guidelines"
							target="_blank"
							onClick={ onUpgradeClick }
						>
							{ __( 'Upgrade', 'jetpack' ) }
						</Button>
						&nbsp;
						<Tooltip
							text={ __(
								'Logo generation costs 10 requests; prompt enhancement costs 1 request each',
								'jetpack'
							) }
							placement="bottom"
						>
							<Icon className="prompt-footer__icon" icon={ info } />
						</Tooltip>
					</div>
				) }
				{ ! isUnlimited && requireUpgrade && <UpgradeNudge /> }
				{ enhancePromptFetchError && (
					<div className="jetpack-ai-logo-generator__prompt-error">
						{ __( 'Error enhancing prompt. Please try again.', 'jetpack' ) }
					</div>
				) }
				{ logoFetchError && (
					<div className="jetpack-ai-logo-generator__prompt-error">
						{ __( 'Error generating logo. Please try again.', 'jetpack' ) }
					</div>
				) }
			</div>
		</div>
	);
};
