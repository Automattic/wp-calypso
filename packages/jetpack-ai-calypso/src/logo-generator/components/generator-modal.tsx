/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Icon, Modal, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import clsx from 'clsx';
import debugFactory from 'debug';
import { useState, useEffect, useCallback } from 'react';
/**
 * Internal dependencies
 */
import {
	DEFAULT_LOGO_COST,
	EVENT_MODAL_OPEN,
	EVENT_FEEDBACK,
	EVENT_MODAL_CLOSE,
	EVENT_PLACEMENT_QUICK_LINKS,
	EVENT_GENERATE,
} from '../../constants';
import useLogoGenerator from '../hooks/use-logo-generator';
import useRequestErrors from '../hooks/use-request-errors';
import { isLogoHistoryEmpty, clearDeletedMedia } from '../lib/logo-storage';
import { STORE_NAME } from '../store';
import { FeatureFetchFailureScreen } from './feature-fetch-failure-screen';
import { FirstLoadScreen } from './first-load-screen';
import { HistoryCarousel } from './history-carousel';
import { LogoPresenter } from './logo-presenter';
import { Prompt } from './prompt';
import { UpgradeScreen } from './upgrade-screen';
import { VisitSiteBanner } from './visit-site-banner';
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
	context,
} ) => {
	const { setSiteDetails, fetchAiAssistantFeature, loadLogoHistory } = useDispatch( STORE_NAME );
	const [ loadingState, setLoadingState ] = useState<
		'loadingFeature' | 'analyzing' | 'generating' | null
	>( null );
	const [ initialPrompt, setInitialPrompt ] = useState< string | undefined >();
	const [ isFirstCallOnOpen, setIsFirstCallOnOpen ] = useState( true );
	const [ needsFeature, setNeedsFeature ] = useState( false );
	const [ needsMoreRequests, setNeedsMoreRequests ] = useState( false );
	const [ upgradeURL, setUpgradeURL ] = useState( '' );
	const { selectedLogo, getAiAssistantFeature, generateFirstPrompt, generateLogo, setContext } =
		useLogoGenerator();
	const { featureFetchError, firstLogoPromptFetchError, clearErrors } = useRequestErrors();
	const siteId = siteDetails?.ID;
	const siteURL = siteDetails?.URL;
	const [ logoAccepted, setLogoAccepted ] = useState( false );

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
			recordTracksEvent( EVENT_GENERATE, { context, tool: 'first-prompt' } );
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
	}, [ context, generateFirstPrompt, generateLogo ] );

	const initializeModal = useCallback( async () => {
		// First fetch the feature data so we have the most up-to-date info from the backend.
		try {
			const feature = await getFeature();
			const hasHistory = ! isLogoHistoryEmpty( String( siteId ) );
			const logoCost = feature?.costs?.[ 'jetpack-ai-logo-generator' ]?.logo ?? DEFAULT_LOGO_COST;
			const promptCreationCost = 1;
			const currentLimit = feature?.currentTier?.value || 0;
			const currentUsage = feature?.usagePeriod?.requestsCount || 0;
			const isUnlimited = currentLimit === 1;
			const hasNoNextTier = ! feature?.nextTier; // If there is no next tier, the user cannot upgrade.

			// The user needs an upgrade immediately if they have no logos and not enough requests remaining for one prompt and one logo generation.
			const needsMoreRequests =
				! isUnlimited &&
				! hasNoNextTier &&
				! hasHistory &&
				currentLimit - currentUsage < logoCost + promptCreationCost;

			// If the site requires an upgrade, set the upgrade URL and show the upgrade screen immediately.
			setNeedsFeature( ! feature?.hasFeature ?? true );
			setNeedsMoreRequests( needsMoreRequests );

			if ( ! feature?.hasFeature || needsMoreRequests ) {
				const upgradeURL = new URL(
					`${ location.origin }/checkout/${ siteDetails?.domain }/${ feature?.nextTier?.slug }`
				);
				upgradeURL.searchParams.set( 'redirect_to', location.href );
				setUpgradeURL( upgradeURL.toString() );
				setLoadingState( null );
				return;
			}

			// Load the logo history and clear any deleted media.
			await clearDeletedMedia( String( siteId ) );
			loadLogoHistory( siteId );

			// If there is any logo, we do not need to generate a first logo again.
			if ( ! isLogoHistoryEmpty( String( siteId ) ) ) {
				setLoadingState( null );
				return;
			}

			// If the site does not require an upgrade and has no logos stored, generate the first prompt based on the site's data.
			generateFirstLogo();
		} catch ( error ) {
			debug( 'Error fetching feature', error );
			setLoadingState( null );
		}
	}, [ getFeature, siteId, loadLogoHistory, generateFirstLogo, siteDetails?.domain ] );

	const handleModalOpen = useCallback( async () => {
		setContext( context );
		recordTracksEvent( EVENT_MODAL_OPEN, { context, placement: EVENT_PLACEMENT_QUICK_LINKS } );

		initializeModal();
	}, [ setContext, context, initializeModal ] );

	const closeModal = () => {
		onClose();
		setLoadingState( null );
		setNeedsFeature( false );
		setNeedsMoreRequests( false );
		clearErrors();
		setLogoAccepted( false );
		recordTracksEvent( EVENT_MODAL_CLOSE, { context, placement: EVENT_PLACEMENT_QUICK_LINKS } );
	};

	const handleApplyLogo = () => {
		setLogoAccepted( true );
	};

	const handleCloseAndReload = () => {
		closeModal();

		setTimeout( () => {
			// Reload the page to update the logo.
			window.location.reload();
		}, 1000 );
	};

	const handleFeedbackClick = () => {
		recordTracksEvent( EVENT_FEEDBACK, { context } );
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

	let body: React.ReactNode;

	if ( loadingState ) {
		body = <FirstLoadScreen state={ loadingState } />;
	} else if ( featureFetchError || firstLogoPromptFetchError ) {
		body = <FeatureFetchFailureScreen onCancel={ closeModal } onRetry={ initializeModal } />;
	} else if ( needsFeature || needsMoreRequests ) {
		body = (
			<UpgradeScreen
				onCancel={ closeModal }
				upgradeURL={ upgradeURL }
				reason={ needsFeature ? 'feature' : 'requests' }
			/>
		);
	} else {
		body = (
			<>
				{ ! logoAccepted && <Prompt initialPrompt={ initialPrompt } /> }
				<LogoPresenter
					logo={ selectedLogo }
					onApplyLogo={ handleApplyLogo }
					logoAccepted={ logoAccepted }
					siteId={ String( siteId ) }
				/>
				{ logoAccepted ? (
					<div className="jetpack-ai-logo-generator__accept">
						<VisitSiteBanner siteURL={ siteURL } onVisitBlankTarget={ handleCloseAndReload } />
						<div className="jetpack-ai-logo-generator__accept-actions">
							<Button variant="link" onClick={ handleCloseAndReload }>
								{ __( 'Close and refresh', 'jetpack' ) }
							</Button>
							<Button href={ siteURL } variant="primary">
								{ __( 'Visit site', 'jetpack' ) }
							</Button>
						</div>
					</div>
				) : (
					<>
						<HistoryCarousel />
						<div className="jetpack-ai-logo-generator__footer">
							<Button
								variant="link"
								className="jetpack-ai-logo-generator__feedback-button"
								href="https://jetpack.com/redirect/?source=jetpack-ai-feedback"
								target="_blank"
								onClick={ handleFeedbackClick }
							>
								<span>{ __( 'Provide feedback', 'jetpack' ) }</span>
								<Icon icon={ external } className="icon" />
							</Button>
						</div>
					</>
				) }
			</>
		);
	}

	return (
		<>
			{ isOpen && (
				<Modal
					className="jetpack-ai-logo-generator-modal"
					onRequestClose={ logoAccepted ? handleCloseAndReload : closeModal }
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					title={ __( 'Jetpack AI Logo Generator', 'jetpack' ) }
				>
					<div
						className={ clsx( 'jetpack-ai-logo-generator-modal__body', {
							'notice-modal':
								needsFeature || needsMoreRequests || featureFetchError || firstLogoPromptFetchError,
						} ) }
					>
						{ body }
					</div>
				</Modal>
			) }
		</>
	);
};
