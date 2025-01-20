import { Guide } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React from 'react';
import guideStep1 from 'calypso/assets/images/sites/sites-guide-1.png';
import guideStep2 from 'calypso/assets/images/sites/sites-guide-2.png';
import './sites-guide.scss';

const storageKey = `sites_guide_is_dismissed`;

const SitesGuide = () => {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ isImageLoading, setIsImageLoading ] = useState( true );

	if ( ! isOpen || localStorage.getItem( storageKey ) ) {
		return null;
	}

	const dismiss = () => {
		localStorage.setItem( storageKey, 'true' );

		setIsOpen( false );
	};

	return (
		<Guide
			className={ `sites-guide ${ isImageLoading ? 'is-loading' : '' }` }
			contentLabel={ __( 'Hosting Panel' ) }
			finishButtonText={ __( 'Got it' ) }
			onFinish={ dismiss }
			pages={ [
				{
					image: (
						<div className="sites-guide__image">
							<img alt="" src={ guideStep1 } onLoad={ () => setIsImageLoading( false ) } />
						</div>
					),
					content: (
						<>
							<h1>{ __( 'Meet your new starting point' ) }</h1>
							<p>
								{ __(
									"Access all your sites, domains, plugins and other tools from one central location. Explore what's new and get started!"
								) }
							</p>
						</>
					),
				},
				{
					image: (
						<div className="sites-guide__image">
							<img alt="" src={ guideStep2 } onLoad={ () => setIsImageLoading( false ) } />
						</div>
					),
					content: (
						<>
							<h1>{ __( 'Your shortcut to WordPress Admin' ) }</h1>
							<p>
								{ __(
									'Quickly jump to the WP Admin by clicking the link in the Actions column, where you can find your site content.'
								) }
							</p>
						</>
					),
				},
			] }
		/>
	);
};

export default SitesGuide;
