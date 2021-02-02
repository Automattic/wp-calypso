/**
 * External dependencies
 */
import * as React from 'react';
import { Guide } from '@wordpress/components';
import { Title } from '@automattic/onboarding';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

import './style.scss';

const Modal = () => {
	const dispatch = useDispatch();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `nav-unification-modal-${ userId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	if ( ! hasPreferences || isDismissed ) {
		return null;
	}

	const handleDismiss = () => {
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	return (
		<Guide
			className="nav-unification-modal__announcement"
			onFinish={ handleDismiss }
			pages={ [
				{
					content: (
						<Page
							image={
								<picture className="nav-unification-modal__picture nav-unification-modal__picture--bottom-right">
									<source
										srcSet="/calypso/images/nav-unification-announcement/unify-nav-desktop-1.jpg"
										media="(min-width: 600px)"
									/>
									<img
										alt="Scrolling sub navigation"
										src="/calypso/images/nav-unification-announcement/unify-nav-mobile-1.jpg"
									/>
								</picture>
							}
							heading="A new way to navigate"
							content="Introducing a single site management experience for WordPress.com."
						/>
					),
				},
				{
					content: (
						<Page
							image={
								<picture className="nav-unification-modal__picture nav-unification-modal__picture--no-margin nav-unification-modal__picture--top-right">
									<source
										srcSet="/calypso/images/nav-unification-announcement/unify-nav-desktop-2.jpg"
										media="(min-width: 600px)"
									/>
									<img
										alt="Scrolling complete navigation"
										src="/calypso/images/nav-unification-announcement/unify-nav-mobile-2.jpg"
									/>
								</picture>
							}
							heading="Everything in one place"
							content="Manage your entire site from the sidebar, all without ever leaving your dashboard."
						/>
					),
				},
				{
					content: (
						<Page
							image={
								<picture className="nav-unification-modal__picture nav-unification-modal__picture--center">
									<source
										srcSet="/calypso/images/nav-unification-announcement/unify-nav-desktop-3.jpg"
										media="(min-width: 600px)"
									/>
									<img
										alt="Scrolling sub navigation"
										src="/calypso/images/nav-unification-announcement/unify-nav-mobile-3.jpg"
									/>
								</picture>
							}
							heading="Make it your own"
							content="Customize the appearance of your navigation from your account settings."
						/>
					),
				},
			] }
		/>
	);
};

const Page = ( { heading, content, image } ) => {
	return (
		<div className="nav-unification-modal__page">
			<div className="nav-unification-modal__text">
				<div className="nav-unification-modal__heading">
					<Title tagName="h2">{ heading }</Title>
				</div>
				<div className="nav-unification-modal__description">
					<p>{ content }</p>
				</div>
			</div>
			<div className="nav-unification-modal__visual">{ image }</div>
		</div>
	);
};

export default Modal;
