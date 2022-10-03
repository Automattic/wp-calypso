/* global wpcomGlobalStyles */

import { Button, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React from 'react';
import image from './image.svg';

import './modal.scss';

const GlobalStylesModal = () => {
	const isVisible = useSelect(
		( select ) => select( 'automattic/wpcom-global-styles' ).isModalVisible(),
		[]
	);
	const { dismissModal } = useDispatch( 'automattic/wpcom-global-styles' );
	const { set: setPreference } = useDispatch( 'core/preferences' );

	// Hide the welcome guide modal, so it doesn't conflict with our modal.
	useEffect( () => {
		if ( isVisible ) {
			setPreference( 'core/edit-site', 'welcomeGuideStyles', false );
		}
	}, [ setPreference, isVisible ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal
			className="wpcom-global-styles-modal"
			onRequestClose={ dismissModal }
			// set to false so that 1Password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<div className="wpcom-global-styles-modal__text">
				<h1 className="wpcom-global-styles-modal__heading">
					{ __( 'A powerful new way to style your site', 'full-site-editing' ) }
				</h1>
				<p className="wpcom-global-styles-modal__description">
					{ __(
						"Change all of your site's fonts, colors and more. Available on any paid plan.",
						'full-site-editing'
					) }
				</p>
				<div className="wpcom-global-styles-modal__actions">
					<Button variant="secondary" onClick={ dismissModal }>
						{ __( 'Try it out', 'full-site-editing' ) }
					</Button>
					<Button variant="primary" href={ wpcomGlobalStyles.upgradeUrl } target="_top">
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
