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
import isNavUnificationNewUser from 'calypso/state/selectors/is-nav-unification-new-user';

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
	const isNewUser = useSelector( isNavUnificationNewUser );
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `nav-unification-modal-${ userId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const translate = useTranslate();

	// Don't show Modal to new users as they have nav-unification enabled by default.
	if ( isNewUser ) {
		return null;
	}

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
								<picture
									className="nav-unification-modal__picture nav-unification-modal__picture--bottom-right"
									key={ desktopOneImg }
								>
									<source srcSet={ desktopOneImg } media="(min-width: 600px)" />
									<img alt="" src={ mobileOneImg } />
								</picture>
							}
							heading={ translate( 'Navigate easier than ever' ) }
							content={ translate(
								'Managing your entire site is simpler than ever. Do it all right from the sidebar without leaving your dashboard.'
							) }
						/>
					),
				},
				{
					content: (
						<Page
							image={
								<picture
									className="nav-unification-modal__picture nav-unification-modal__picture--center"
									key={ desktopTwoImg }
								>
									<source srcSet={ desktopTwoImg } media="(min-width: 600px)" />
									<img alt="" src={ mobileTwoImg } />
								</picture>
							}
							heading={ translate( 'Do even more' ) }
							content={ translate(
								'Advanced admin features have a new home! You can find them in your {{a}}Account Settings{{/a}}.',
								{
									components: {
										a: <a href="/me/account" target="_blank" rel="noopener noreferrer" />,
									},
								}
							) }
						/>
					),
				},
				{
					content: (
						<Page
							image={
								<picture
									className="nav-unification-modal__picture nav-unification-modal__picture--bottom-center-small nav-unification-modal__picture--center"
									key={ desktopThreeImg }
								>
									<source srcSet={ desktopThreeImg } media="(min-width: 600px)" />
									<img alt="" src={ mobileThreeImg } />
								</picture>
							}
							heading={ translate( 'Create in color' ) }
							content={ translate(
								'Now you can choose a new color for your dashboard in {{a}}Account Settings{{/a}}.',
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
