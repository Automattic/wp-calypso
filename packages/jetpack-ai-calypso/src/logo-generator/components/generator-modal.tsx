/**
 * External dependencies
 */
import { Icon, Modal, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import debugFactory from 'debug';
import React, { useState, useEffect } from 'react';
/**
 * Internal dependencies
 */
import useLogoGenerator from '../hooks/use-logo-generator';
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

const debug = debugFactory( 'jetpack-ai-calypso:generator-modal' );

export const GeneratorModal: React.FC< GeneratorModalProps > = ( {
	isOpen,
	onClose,
	siteDetails,
} ) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { setSiteDetails, fetchAiAssistantFeature, loadLogoHistory } = useDispatch( STORE_NAME );
	const [ isLoading, setIsLoading ] = useState( true );
	const { selectedLogo } = useLogoGenerator();
	const siteId = siteDetails?.ID;

	useEffect( () => {
		if ( siteId ) {
			setSiteDetails( siteDetails );
		}
	}, [ siteId, siteDetails, setSiteDetails ] );

	useEffect( () => {
		if ( isOpen ) {
			if ( siteId ) {
				debug( 'fetching ai assistant feature for site', siteId );
				fetchAiAssistantFeature( String( siteId ) );
				loadLogoHistory( siteId );
			}

			setTimeout( () => {
				setIsLoading( false );
			}, 1000 );
		} else {
			setIsLoading( true );
		}
	}, [ isOpen, fetchAiAssistantFeature, siteId, loadLogoHistory ] );

	const handleApplyLogo = () => {
		onClose();

		setTimeout( () => {
			// Reload the page to update the logo.
			window.location.reload();
		}, 1000 );
	};

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
						{ isLoading ? (
							<FirstLoadScreen />
						) : (
							<>
								<Prompt />
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
