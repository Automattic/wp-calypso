/* global wpcomGlobalStyles */

import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React from 'react';
import image from './image.svg';

import './modal.scss';

const GlobalStylesModal = () => {
	const [ isVisible, setIsVisible ] = useState( true );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal
			className="wpcom-global-styles-modal"
			open={ isVisible }
			onRequestClose={ () => setIsVisible( false ) }
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
					<Button variant="secondary" onClick={ () => setIsVisible( false ) }>
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
