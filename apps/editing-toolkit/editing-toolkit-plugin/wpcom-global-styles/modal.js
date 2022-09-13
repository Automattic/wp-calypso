import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React from 'react';

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
			title={ __( 'A powerful new way to style your site', 'full-site-editing' ) }
			onRequestClose={ () => setIsVisible( false ) }
		>
			<p>
				{ __(
					"Change all of your site's fonts, colors and more. Available on any paid plan.",
					'full-site-editing'
				) }
				<Button variant="secondary" onClick={ () => setIsVisible( false ) }>
					{ __( 'Try it out', 'full-site-editing' ) }
				</Button>
				<Button variant="primary" href="#" target="_top">
					{ __( 'Upgrade plan', 'full-site-editing' ) }
				</Button>
			</p>
		</Modal>
	);
};

export default GlobalStylesModal;
