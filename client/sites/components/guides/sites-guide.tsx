import { Guide } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import React from 'react';
import guideStep1 from 'calypso/assets/images/sites/sites-guide-1.png';
import guideStep2 from 'calypso/assets/images/sites/sites-guide-2.png';
import './sites-guide.scss';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const PREFERENCE_KEY = `sites_guide_is_dismissed`;

const SitesGuide = () => {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ isImageLoading, setIsImageLoading ] = useState( true );
	const dispatch = useDispatch();
	const isDismissed = useSelector( ( state ) => getPreference( state, PREFERENCE_KEY ) );

	if ( ! isOpen || isDismissed ) {
		return null;
	}

	const dismiss = () => {
		setIsOpen( false );
		dispatch( savePreference( PREFERENCE_KEY, true ) );
	};

	return (
		<Guide
			className={ clsx( 'sites-guide', { 'is-loading': isImageLoading } ) }
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
							<h1>{ __( 'Meet your starting point' ) }</h1>
							<p>
								{ __(
									'Access all your sites, domains, plugins and other tools from one central location.'
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
