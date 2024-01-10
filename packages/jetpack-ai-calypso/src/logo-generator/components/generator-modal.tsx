/**
 * External dependencies
 */
import { Icon, Modal, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import debugFactory from 'debug';
import { useState, useEffect, useCallback } from 'react';
/**
 * Internal dependencies
 */
import useLogoGenerator from '../hooks/use-logo-generator';
import { isLogoHistoryEmpty } from '../lib/logo-storage';
import { STORE_NAME } from '../store';
import { FirstLoadScreen } from './first-load-screen';
import { HistoryCarousel } from './history-carousel';
import { LogoPresenter } from './logo-presenter';
import { Prompt } from './prompt';
import './generator-modal.scss';
/**
 * Types
 */
import type { GeneratorModalProps } from '../../types';
import type { AiFeatureProps } from '../store/types';
import type React from 'react';

const debug = debugFactory( 'jetpack-ai-calypso:generator-modal' );

export const GeneratorModal: React.FC< GeneratorModalProps > = ( {
	isOpen,
	onClose,
	siteDetails,
} ) => {
	const { setSiteDetails, fetchAiAssistantFeature, loadLogoHistory } = useDispatch( STORE_NAME );
	const [ loadingState, setLoadingState ] = useState<
		'loadingFeature' | 'analyzing' | 'generating' | null
	>( null );
	const [ initialPrompt, setInitialPrompt ] = useState< string | undefined >();
	const [ isFirstCallOnOpen, setIsFirstCallOnOpen ] = useState( true );
	const { selectedLogo, getAiAssistantFeature, generateFirstPrompt, generateLogo } =
		useLogoGenerator();
	const siteId = siteDetails?.ID;

	const getFeature = useCallback( async () => {
		setLoadingState( 'loadingFeature' );
		debug( 'Fetching AI assistant feature for site', siteId );
		await fetchAiAssistantFeature( String( siteId ) );

		// Wait for store to update.
		return new Promise< Partial< AiFeatureProps > >( ( resolve ) => {
			setTimeout( () => {
				resolve( getAiAssistantFeature( String( siteId ) ) );
			}, 100 );
		} );
	}, [ fetchAiAssistantFeature, getAiAssistantFeature, siteId ] );

	const generateFirstLogo = useCallback( async () => {
		try {
			// First generate the prompt based on the site's data.
			setLoadingState( 'analyzing' );
			const prompt = await generateFirstPrompt();
			setInitialPrompt( prompt );

			// Then generate the logo based on the prompt.
			setLoadingState( 'generating' );
			await generateLogo( { prompt } );
			setLoadingState( null );
		} catch ( error ) {
			debug( 'Error generating first logo', error );
			setLoadingState( null );
		}
	}, [ generateFirstPrompt, generateLogo ] );

	const handleModalOpen = useCallback( async () => {
		loadLogoHistory( siteId );

		// First fetch the feature data so we have the most up-to-date info from the backend.
		try {
			const feature = await getFeature();

			// If there is any logo we do not need to generate a first logo again.
			if ( ! isLogoHistoryEmpty( String( siteId ) ) ) {
				setLoadingState( null );
				return;
			}

			if ( feature?.requireUpgrade ) {
				// TODO: Show upgrade screen.
				setLoadingState( null );
			} else {
				// If the site does not require an upgrade, generate the first prompt based on the site's data.
				generateFirstLogo();
			}
		} catch ( error ) {
			debug( 'Error fetching feature', error );
			setLoadingState( null );
		}
	}, [ loadLogoHistory, siteId, getFeature, generateFirstLogo ] );

	const handleApplyLogo = () => {
		onClose();

		setTimeout( () => {
			// Reload the page to update the logo.
			window.location.reload();
		}, 1000 );
	};

	// Set site details when siteId changes
	useEffect( () => {
		if ( siteId ) {
			setSiteDetails( siteDetails );
		}
	}, [ siteId, siteDetails, setSiteDetails ] );

	// Handles modal opening logic
	useEffect( () => {
		if ( ! isOpen || ! siteId ) {
			return;
		}

		// Prevent multiple async calls
		if ( isFirstCallOnOpen ) {
			setIsFirstCallOnOpen( false );
			handleModalOpen();
		}
	}, [ isOpen, siteId, isFirstCallOnOpen, setIsFirstCallOnOpen, handleModalOpen ] );

	// Reset the modal first call flag
	useEffect( () => {
		if ( ! isOpen ) {
			setIsFirstCallOnOpen( true );
		}
	}, [ isOpen ] );

	return (
		<>
			{ isOpen && (
				<Modal
					className="jetpack-ai-logo-generator-modal"
					onRequestClose={ onClose }
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					title={ __( 'Jetpack AI Logo Generator', 'jetpack' ) }
				>
					<div className="jetpack-ai-logo-generator-modal__body">
						{ loadingState ? (
							<FirstLoadScreen state={ loadingState } />
						) : (
							<>
								<Prompt initialPrompt={ initialPrompt } />
								<LogoPresenter logo={ selectedLogo } onApplyLogo={ handleApplyLogo } />
								<HistoryCarousel />
								<div className="jetpack-ai-logo-generator__footer">
									<Button
										variant="link"
										className="jetpack-ai-logo-generator__feedback-button"
										href="https://jetpack.com/redirect/?source=jetpack-ai-feedback"
										target="_blank"
									>
										<span>{ __( 'Provide feedback', 'jetpack' ) }</span>
										<Icon icon={ external } className="icon" />
									</Button>
								</div>
							</>
						) }
					</div>
				</Modal>
			) }
		</>
	);
};
