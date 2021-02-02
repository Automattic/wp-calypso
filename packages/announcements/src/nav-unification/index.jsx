/**
 * External dependencies
 */
import * as React from 'react';
import { Guide } from '@wordpress/components';
import { Title } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import './style.scss';

const Modal = ( { onDismiss, isEnabled = false } ) => {
	const [ isOpen, setIsOpen ] = React.useState( isEnabled );

	if ( ! isOpen ) {
		return null;
	}

	const handleDismiss = () => {
		setIsOpen( false );
		if ( typeof onDismiss === 'function' ) {
			onDismiss();
		}
	};

	// /calypso/images/me/get-apps-google-play.png

	return (
		<Guide
			className="nav-unification__announcment"
			onFinish={ handleDismiss }
			pages={ [
				{
					image: (
						<div className="nav-unification__image">
							<div className="nav-unification__image-inner">
								<img alt="sky" src="https://placeimg.com/600/330/any" />
							</div>
						</div>
					),
					content: (
						<div className="nav-unification__content">
							<div className="nav-unification__content-inner">
								<Title tagName="h2">A new way to navigate</Title>
								<p>Introducing a single site management experience for WordPress.com.</p>
							</div>
						</div>
					),
				},
				{
					image: (
						<div className="nav-unification__image">
							<div className="nav-unification__image-inner">
								<img alt="sky" src="https://placeimg.com/600/330/any" />
							</div>
						</div>
					),
					content: (
						<div className="nav-unification__content">
							<div className="nav-unification__content-inner">
								<Title tagName="h2">Everything in one place</Title>
								<p>
									Manage your entire site from the sidebar, all without ever leaving your dashboard.
								</p>
							</div>
						</div>
					),
				},
				{
					image: (
						<div className="nav-unification__image">
							<div className="nav-unification__image-inner">
								<img alt="sky" src="https://placeimg.com/600/330/any" />
							</div>
						</div>
					),
					content: (
						<div className="nav-unification__content">
							<div className="nav-unification__content-inner">
								<Title tagName="h2">Make it your own</Title>
								<p>Customize the appearance of your navigation from your account settings.</p>
							</div>
						</div>
					),
				},
			] }
		/>
	);
};

export default Modal;
