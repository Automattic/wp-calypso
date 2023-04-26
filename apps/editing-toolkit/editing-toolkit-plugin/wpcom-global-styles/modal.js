/* global wpcomGlobalStyles */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Modal } from '@wordpress/components';
import { subscribe, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React from 'react';
import image from './image.svg';

import './modal.scss';

const GlobalStylesModal = () => {
	const [ viewCanvasPath, setViewCanvasPath ] = useState();

	// Since Gutenberg doesn't provide a stable selector to get the current path of
	// the view canvas, we need to infer it from the URL.
	useEffect( () => {
		const unsubscribe = subscribe( () => {
			// Subscriber callbacks run before the URL actually changes, so we need
			// to delay the execution.
			setTimeout( () => {
				const params = new URLSearchParams( window.location.search );

				const canvasMode = params.get( 'canvas' ) ?? 'view';
				setViewCanvasPath( canvasMode === 'view' ? params.get( 'path' ) : undefined );
			}, 0 );
		}, 'core/edit-site' );

		return () => unsubscribe();
	}, [] );

	const isVisible = useSelect(
		( select ) => {
			const currentSidebar =
				select( 'core/interface' ).getActiveComplementaryArea( 'core/edit-site' );
			return select( 'automattic/wpcom-global-styles' ).isModalVisible(
				currentSidebar,
				viewCanvasPath
			);
		},
		[ viewCanvasPath ]
	);

	const { dismissModal } = useDispatch( 'automattic/wpcom-global-styles' );
	const { set: setPreference } = useDispatch( 'core/preferences' );

	// Hide the welcome guide modal, so it doesn't conflict with our modal.
	useEffect( () => {
		setPreference( 'core/edit-site', 'welcomeGuideStyles', false );
	}, [ setPreference ] );

	useEffect( () => {
		if ( isVisible ) {
			recordTracksEvent( 'calypso_global_styles_gating_modal_show', {
				context: 'site-editor',
			} );
		}
	}, [ isVisible ] );

	const closeModal = () => {
		dismissModal();
		recordTracksEvent( 'calypso_global_styles_gating_modal_dismiss', {
			context: 'site-editor',
		} );
	};

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal
			className="wpcom-global-styles-modal"
			onRequestClose={ closeModal }
			// set to false so that 1Password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<div className="wpcom-global-styles-modal__content">
				<div className="wpcom-global-styles-modal__text">
					<h1 className="wpcom-global-styles-modal__heading">
						{ __( 'A powerful new way to style your site', 'full-site-editing' ) }
					</h1>
					<p className="wpcom-global-styles-modal__description">
						{ __(
							"Change all of your site's fonts, colors and more. Available on the Premium plan.",
							'full-site-editing'
						) }
					</p>
					<div className="wpcom-global-styles-modal__actions">
						<Button variant="secondary" onClick={ closeModal }>
							{ __( 'Try it out', 'full-site-editing' ) }
						</Button>
						<Button
							variant="primary"
							href={ wpcomGlobalStyles.upgradeUrl }
							target="_top"
							onClick={ () =>
								recordTracksEvent( 'calypso_global_styles_gating_modal_upgrade_click', {
									context: 'site-editor',
								} )
							}
						>
							{ __( 'Upgrade plan', 'full-site-editing' ) }
						</Button>
					</div>
				</div>
				<div className="wpcom-global-styles-modal__image">
					<img src={ image } alt="" />
				</div>
			</div>
		</Modal>
	);
};

export default GlobalStylesModal;
