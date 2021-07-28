/**
 * External dependencies
 */
import React from 'react';
import { Guide } from '@wordpress/components';
import { Title } from '@automattic/onboarding';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isNewUserId from 'calypso/state/selectors/is-new-user-id';

/**
 * Image dependencies
 */
import featureImage from 'calypso/assets/images/nav-unification-announcement/quick-switch-feature-no-text.png';

/**
 * Style dependencies
 */
import './style.scss';

// User registered on 28 July 2021
const NEW_USER_THRESHOLD = 209492113;

const Page = ( { heading, content, image } ) => {
	return (
		<div className="nav-unification-quick-switch-modal__page">
			<div className="nav-unification-quick-switch-modal__text">
				<div className="nav-unification-quick-switch-modal__heading">
					<Title tagName="h2">{ heading }</Title>
				</div>
				<div className="nav-unification-quick-switch-modal__description">
					<p>{ content }</p>
				</div>
			</div>
			<div className="nav-unification-quick-switch-modal__visual">{ image }</div>
		</div>
	);
};

const Modal = () => {
	const dispatch = useDispatch();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const isNewUser = useSelector( ( state ) => isNewUserId( state, NEW_USER_THRESHOLD ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `nav-unification-quick-switch-modal-${ userId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const translate = useTranslate();

	if ( ! hasPreferences || isDismissed || isNewUser ) {
		return null;
	}

	const handleDismiss = () => {
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	return (
		<Guide
			className="nav-unification-quick-switch-modal"
			onFinish={ handleDismiss }
			pages={ [
				{
					content: (
						<Page
							image={
								<picture
									className="nav-unification-quick-switch-modal__picture nav-unification-quick-switch-modal__picture--bottom-left"
									key={ featureImage }
								>
									<source srcSet={ featureImage } media="(min-width: 600px)" />
									<img alt="" src={ featureImage } />
								</picture>
							}
							heading={ translate( 'Not seeing what you need?' ) }
							content={ translate(
								'You can switch between the default or classic views via the Screen Options selections at the top right of your screen. The choice you make for any page will be remembered each time you return.'
							) }
						/>
					),
				},
			] }
		/>
	);
};

export default Modal;
