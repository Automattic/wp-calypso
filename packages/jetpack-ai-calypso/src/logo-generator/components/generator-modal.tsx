/**
 * External dependencies
 */
import { Icon, Modal, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import React, { useState, useEffect } from 'react';
/**
 * Internal dependencies
 */
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
import type { Selectors } from '../store/types';

export const GeneratorModal: React.FC< GeneratorModalProps > = ( { isOpen, onClose } ) => {
	const [ isLoading, setIsLoading ] = useState( true );
	const { selectedLogo } = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return { selectedLogo: selectors.getSelectedLogo() };
	}, [] );

	useEffect( () => {
		if ( isOpen ) {
			setTimeout( () => {
				setIsLoading( false );
			}, 1000 );
		} else {
			setIsLoading( true );
		}
	}, [ isOpen ] );

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
