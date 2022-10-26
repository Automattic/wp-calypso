/* global wpcomGlobalStyles */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React from 'react';
import image from './image.svg';

import './modal.scss';

const GlobalStylesModal = () => {
	const params = new URLSearchParams( window.location.search );
	const [ showUnlockStylesModal, setShowUnlockStylesModal ] = useState(
		params.get( 'unlock-styles' ) && wpcomGlobalStyles.inUse
	);

	const isVisible = useSelect(
		( select ) => {
			if ( ! showUnlockStylesModal ) {
				return select( 'automattic/wpcom-global-styles' ).isModalVisible();
			}

			// Show unlock styles modal on load, but wait for the global styles to be ready.
			const { getEditedPostId, getEditedPostType } = select( 'core/edit-site' );
			if ( getEditedPostType() === undefined || getEditedPostId() === undefined ) {
				return false;
			}

			const {
				getEditedEntityRecord,
				__experimentalGetCurrentGlobalStylesId,
				__experimentalGetCurrentThemeBaseGlobalStyles,
			} = select( 'core' );
			// Do not wait any longer if the experimental selectors are not available.
			if (
				! __experimentalGetCurrentGlobalStylesId ||
				! __experimentalGetCurrentThemeBaseGlobalStyles
			) {
				return true;
			}

			const userGlobalStyles = getEditedEntityRecord(
				'root',
				'globalStyles',
				__experimentalGetCurrentGlobalStylesId()
			);
			const baseGlobalStyles = __experimentalGetCurrentThemeBaseGlobalStyles();

			return (
				( !! userGlobalStyles?.settings || !! userGlobalStyles?.styles ) && !! baseGlobalStyles
			);
		},
		[ showUnlockStylesModal ]
	);
	const { dismissModal } = useDispatch( 'automattic/wpcom-global-styles' );
	const { set: setPreference } = useDispatch( 'core/preferences' );
	const { enableComplementaryArea } = useDispatch( 'core/interface' );

	// Hide the welcome guide modal, so it doesn't conflict with our modal.
	useEffect( () => {
		setPreference( 'core/edit-site', 'welcomeGuideStyles', false );
	}, [ setPreference ] );

	useEffect( () => {
		if ( showUnlockStylesModal ) {
			enableComplementaryArea( 'core/edit-site', 'edit-site/global-styles' );
		}
	}, [ enableComplementaryArea, showUnlockStylesModal ] );

	useEffect( () => {
		if ( isVisible ) {
			recordTracksEvent( 'calypso_global_styles_gating_modal_show', {
				context: 'site-editor',
			} );
		}
	}, [ isVisible ] );

	const closeModal = () => {
		dismissModal();
		setShowUnlockStylesModal( false );
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
			<div className="wpcom-global-styles-modal__text">
				<h1 className="wpcom-global-styles-modal__heading">
					{ showUnlockStylesModal
						? __( 'Publish your new site styles', 'full-site-editing' )
						: __( 'A powerful new way to style your site', 'full-site-editing' ) }
				</h1>
				<p className="wpcom-global-styles-modal__description">
					{ showUnlockStylesModal
						? __(
								"To activate your site styles, and unlock advanced design customization tools, you'll need upgrade to a paid plan.",
								'full-site-editing'
						  )
						: __(
								"Change all of your site's fonts, colors and more. Available on any paid plan.",
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
		</Modal>
	);
};

export default GlobalStylesModal;
