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

/**
 * Image dependencies
 */
import desktopOneImg from 'calypso/assets/images/nav-unification-announcement/unify-nav-desktop-1.png';
import desktopTwoImg from 'calypso/assets/images/nav-unification-announcement/unify-nav-desktop-2.png';
import desktopThreeImg from 'calypso/assets/images/nav-unification-announcement/unify-nav-desktop-3.png';
import mobileOneImg from 'calypso/assets/images/nav-unification-announcement/unify-nav-mobile-1.png';
import mobileTwoImg from 'calypso/assets/images/nav-unification-announcement/unify-nav-mobile-2.png';
import mobileThreeImg from 'calypso/assets/images/nav-unification-announcement/unify-nav-mobile-3.png';

/**
 * Style dependencies
 */
import './style.scss';

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

const Modal = () => {
	const dispatch = useDispatch();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `nav-unification-modal-${ userId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const translate = useTranslate();

	/**
	 * Since we don't extract strings from external packages in node_modules,
	 * translatable strings from the Guide component are not being extracted.
	 * In order to get these strings extracted and their translations loaded,
	 * we need to have the following translate calls included in this component.
	 */
	translate( 'Previous' );
	translate( 'Next' );
	translate( 'Finish' );

	if ( ! hasPreferences || isDismissed ) {
		return null;
	}

	const handleDismiss = () => {
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	return (
		<Guide
			className="nav-unification-modal"
			onFinish={ handleDismiss }
			pages={ [
				{
					content: (
						<Page
							image={
								<picture className="nav-unification-modal__picture nav-unification-modal__picture--bottom-right">
									<source srcSet={ desktopOneImg } media="(min-width: 600px)" />
									<img alt={ translate( 'Scrolling sub navigation' ) } src={ mobileOneImg } />
								</picture>
							}
							heading={ translate( 'A new way to navigate' ) }
							content={ translate(
								'Introducing a single site management experience for WordPress.com.'
							) }
						/>
					),
				},
				{
					content: (
						<Page
							image={
								<picture className="nav-unification-modal__picture nav-unification-modal__picture--no-margin nav-unification-modal__picture--top-right">
									<source srcSet={ desktopTwoImg } media="(min-width: 600px)" />
									<img alt={ translate( 'Scrolling complete navigation' ) } src={ mobileTwoImg } />
								</picture>
							}
							heading={ translate( 'Everything in one place' ) }
							content={ translate(
								'Manage your entire site from the sidebar, all without ever leaving your dashboard.'
							) }
						/>
					),
				},
				{
					content: (
						<Page
							image={
								<picture className="nav-unification-modal__picture nav-unification-modal__picture--center">
									<source srcSet={ desktopThreeImg } media="(min-width: 600px)" />
									<img alt={ translate( 'Scrolling sub navigation' ) } src={ mobileThreeImg } />
								</picture>
							}
							heading={ translate( 'Make it your own' ) }
							content={ translate(
								'Customize the appearance of your navigation from your {{a}}account settings{{/a}}.',
								{
									components: {
										a: <a href="/me/account" />,
									},
								}
							) }
						/>
					),
				},
			] }
		/>
	);
};

export default Modal;
