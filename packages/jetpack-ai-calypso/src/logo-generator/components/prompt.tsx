/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Tooltip, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import debugFactory from 'debug';
import { useCallback, useEffect, useState, useRef } from 'react';
/**
 * Internal dependencies
 */
import {
	EVENT_GENERATE,
	MINIMUM_PROMPT_LENGTH,
	EVENT_UPGRADE,
	EVENT_PLACEMENT_INPUT_FOOTER,
} from '../../constants';
import AiIcon from '../assets/icons/ai';
import { useCheckout } from '../hooks/use-checkout';
import useLogoGenerator from '../hooks/use-logo-generator';
import useRequestErrors from '../hooks/use-request-errors';
import { IMAGE_STYLE_NONE } from '../store/constants';
import { UpgradeNudge } from './upgrade-nudge';
import type { ImageStyle, ImageStyleObject, LogoGeneratorFeatureControl } from '../store/types';
import './prompt.scss';

const debug = debugFactory( 'jetpack-ai-calypso:prompt-box' );

export const Prompt: React.FC< { initialPrompt?: string } > = ( { initialPrompt = '' } ) => {
	const [ prompt, setPrompt ] = useState< string >( initialPrompt );
	const [ requestsRemaining, setRequestsRemaining ] = useState( 0 );
	const { enhancePromptFetchError, logoFetchError } = useRequestErrors();
	const { nextTierCheckoutURL: checkoutUrl, hasNextTier } = useCheckout();
	const hasPrompt = prompt?.length >= MINIMUM_PROMPT_LENGTH;
	const [ style, setStyle ] = useState< ImageStyle >( IMAGE_STYLE_NONE );
	const [ styles, setStyles ] = useState< Array< ImageStyleObject > >( [] );
	const [ showStyleSelector, setShowStyleSelector ] = useState( false );

	const {
		generateLogo,
		enhancePrompt,
		setIsEnhancingPrompt,
		isBusy,
		isEnhancingPrompt,
		site,
		getAiAssistantFeature,
		requireUpgrade,
		context,
	} = useLogoGenerator();

	const enhancingLabel = __( 'Enhancing…', 'jetpack' );
	const enhanceLabel = __( 'Enhance prompt', 'jetpack' );
	const enhanceButtonLabel = isEnhancingPrompt ? enhancingLabel : enhanceLabel;

	const inputRef = useRef< HTMLDivElement | null >( null );

	const onEnhance = useCallback( async () => {
		debug( 'Enhancing prompt', prompt );
		setIsEnhancingPrompt( true );
		recordTracksEvent( EVENT_GENERATE, { context, tool: 'enhance-prompt' } );

		try {
			const enhancedPrompt = await enhancePrompt( { prompt } );
			setPrompt( enhancedPrompt );
			setIsEnhancingPrompt( false );
		} catch ( error ) {
			debug( 'Error enhancing prompt', error );
			setIsEnhancingPrompt( false );
		}
	}, [ context, enhancePrompt, prompt, setIsEnhancingPrompt ] );

	const featureData = getAiAssistantFeature( String( site?.id || '' ) );

	const currentLimit = featureData?.currentTier?.value || 0;
	const currentUsage = featureData?.usagePeriod?.requestsCount || 0;
	const isUnlimited = currentLimit === 1;
	const featureControl = featureData?.featuresControl?.[
		'logo-generator'
	] as LogoGeneratorFeatureControl;

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
		recordTracksEvent( EVENT_GENERATE, { context, tool: 'image', style } );
		generateLogo( { prompt, style } );
	}, [ context, generateLogo, prompt, style ] );

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
		recordTracksEvent( EVENT_UPGRADE, { context, placement: EVENT_PLACEMENT_INPUT_FOOTER } );
	};

	// initialize styles dropdown
	useEffect( () => {
		const isEnabled = featureControl?.enabled || false;
		const imageStyles = featureControl?.styles || [];
		if ( isEnabled && imageStyles && imageStyles.length > 0 ) {
			// Sort styles to have "None" first
			setStyles(
				[
					imageStyles.find( ( { value } ) => value === IMAGE_STYLE_NONE ),
					...imageStyles.filter( ( { value } ) => ! [ IMAGE_STYLE_NONE ].includes( value ) ),
				].filter( ( v ): v is ImageStyleObject => !! v ) // Type guard to filter out undefined values
			);
			setShowStyleSelector( true );
			setStyle( IMAGE_STYLE_NONE );
		}
	}, [ featureControl ] );

	const updateStyle = useCallback(
		( imageStyle: ImageStyle ) => {
			debug( 'change style', imageStyle );
			setStyle( imageStyle );
			recordTracksEvent( 'jetpack_ai_image_generator_switch_style', {
				context,
				style: imageStyle,
			} );
		},
		[ setStyle, context ]
	);

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
					{ showStyleSelector && (
						<div>
							<SelectControl
								__nextHasNoMarginBottom
								value={ style }
								options={ styles }
								onChange={ updateStyle }
							/>
						</div>
					) }
				</div>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-query">
				<div
					ref={ inputRef }
					contentEditable={ ! isBusy && ! requireUpgrade }
					// The content editable div is expected to be updated by the enhance prompt, so warnings are suppressed
					suppressContentEditableWarning
					className="prompt-query__input"
					onInput={ onPromptInput }
					onPaste={ onPromptPaste }
					data-placeholder={ __(
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
						{ hasNextTier && (
							<>
								&nbsp;
								<Button
									variant="link"
									href={ checkoutUrl }
									target="_blank"
									onClick={ onUpgradeClick }
								>
									{ __( 'Upgrade', 'jetpack' ) }
								</Button>
							</>
						) }
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
