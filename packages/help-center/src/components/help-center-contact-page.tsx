/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Spinner, GMClosureNotice } from '@automattic/components';
import { isDefaultLocale, getLanguage, useLocale } from '@automattic/i18n-utils';
import { useEffect, useMemo } from '@wordpress/element';
import { hasTranslation, sprintf } from '@wordpress/i18n';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { BackButton } from '..';
import {
	useChatStatus,
	useIsWapuuEnabled,
	useShouldRenderChatOption,
	useShouldRenderEmailOption,
	useStillNeedHelpURL,
	useZendeskMessaging,
} from '../hooks';
import { Mail, Forum } from '../icons';
import { HelpCenterActiveTicketNotice } from './help-center-notice';

const ConditionalLink: FC< { active: boolean } & LinkProps > = ( { active, ...props } ) => {
	if ( active ) {
		return <Link { ...props } />;
	}
	return <span { ...props }></span>;
};

export const HelpCenterContactPage: FC = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const isWapuuEnabled = useIsWapuuEnabled();
	const renderEmail = useShouldRenderEmailOption();
	const {
		hasActiveChats,
		isChatAvailable,
		isEligibleForChat,
		isLoading: isLoadingChatStatus,
		supportActivity,
	} = useChatStatus();
	useZendeskMessaging(
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats,
		isEligibleForChat || hasActiveChats
	);
	const renderChat = useShouldRenderChatOption(
		isChatAvailable || hasActiveChats,
		isEligibleForChat
	);
	const isLoading = renderEmail.isLoading || isLoadingChatStatus;

	useEffect( () => {
		if ( isLoading ) {
			return;
		}
		recordTracksEvent( 'calypso_helpcenter_contact_options_impression', {
			force_site_id: true,
			location: 'help-center',
			chat_available: renderChat.state === 'AVAILABLE',
			email_available: renderEmail.render,
		} );
	}, [ isLoading, renderChat.state, renderEmail.render ] );

	const liveChatHeaderText = useMemo( () => {
		if ( isDefaultLocale( locale ) || ! hasTranslation( 'Live chat (English)' ) ) {
			return __( 'Live chat', __i18n_text_domain__ );
		}

		return __( 'Live chat (English)', __i18n_text_domain__ );
	}, [ __, locale ] );

	const emailHeaderText = useMemo( () => {
		if ( isDefaultLocale( locale ) ) {
			return __( 'Email', __i18n_text_domain__ );
		}

		const isLanguageSupported = ( config( 'upwork_support_locales' ) as Array< string > ).includes(
			locale
		);

		if ( isLanguageSupported ) {
			const language = getLanguage( locale )?.name;
			return language && hasTranslation( 'Email (%s)' )
				? sprintf(
						// translators: %s is the language name
						__( 'Email (%s)', __i18n_text_domain__ ),
						language
				  )
				: __( 'Email', __i18n_text_domain__ );
		}

		if ( hasTranslation( 'Email (English)' ) ) {
			return __( 'Email (English)', __i18n_text_domain__ );
		}

		return __( 'Email', __i18n_text_domain__ );
	}, [ __, locale ] );

	const forumtHeaderText = useMemo( () => {
		if ( isDefaultLocale( locale ) || ! hasTranslation( 'Public Forums (English)' ) ) {
			return __( 'Public Forums', __i18n_text_domain__ );
		}

		return __( 'Public Forums (English)', __i18n_text_domain__ );
	}, [ __, locale ] );

	if ( isLoading ) {
		return (
			<div className="help-center-contact-page__loading">
				<Spinner baseClassName="" />
			</div>
		);
	}

	return (
		<div className="help-center-contact-page">
			<BackButton />
			<div className="help-center-contact-page__content">
				<h3>{ __( 'Contact our WordPress.com experts', __i18n_text_domain__ ) }</h3>
				{ supportActivity && <HelpCenterActiveTicketNotice tickets={ supportActivity } /> }
				{ /* Easter */ }
				<GMClosureNotice
					displayAt="2023-04-03 00:00Z"
					closesAt="2023-04-09 00:00Z"
					reopensAt="2023-04-10 07:00Z"
					enabled={ renderChat.render }
				/>

				<div className={ classnames( 'help-center-contact-page__boxes' ) }>
					<Link to="/contact-form?mode=FORUM">
						<div
							className={ classnames( 'help-center-contact-page__box', 'forum' ) }
							role="button"
							tabIndex={ 0 }
						>
							<div className="help-center-contact-page__box-icon">
								<Icon icon={ <Forum /> } />
							</div>
							<div>
								<h2>{ forumtHeaderText }</h2>
								<p>{ __( 'Ask our WordPress.com community', __i18n_text_domain__ ) }</p>
							</div>
						</div>
					</Link>

					{ renderChat.render && (
						<div className={ classnames( { disabled: renderChat.state !== 'AVAILABLE' } ) }>
							<ConditionalLink
								active={ renderChat.state === 'AVAILABLE' }
								to="/contact-form?mode=CHAT"
							>
								<div
									className={ classnames( 'help-center-contact-page__box', 'chat', {
										'is-disabled': renderChat.state !== 'AVAILABLE',
									} ) }
									role="button"
									tabIndex={ 0 }
								>
									<div className="help-center-contact-page__box-icon">
										<Icon icon={ comment } />
									</div>
									<div>
										<h2>{ liveChatHeaderText }</h2>
										<p>
											{ renderChat.state !== 'AVAILABLE'
												? __( 'Chat is unavailable right now', __i18n_text_domain__ )
												: __( 'Get an immediate reply', __i18n_text_domain__ ) }
										</p>
									</div>
								</div>
							</ConditionalLink>
						</div>
					) }

					{ renderEmail.render && (
						<Link
							// set overflow flag when chat is not available nor closed, and the user is eligible to chat, but still sends a support ticket
							to={ `/contact-form?mode=EMAIL&overflow=${ (
								renderChat.eligible && renderChat.state !== 'AVAILABLE'
							).toString() }` }
						>
							<div
								className={ classnames( 'help-center-contact-page__box', 'email' ) }
								role="button"
								tabIndex={ 0 }
							>
								<div className="help-center-contact-page__box-icon">
									<Icon icon={ <Mail /> } />
								</div>
								<div>
									<h2>{ emailHeaderText }</h2>
									<p>{ __( 'An expert will get back to you soon', __i18n_text_domain__ ) }</p>
								</div>
							</div>
						</Link>
					) }
					{ isWapuuEnabled && (
						<Link to="/odie">
							<div
								className={ classnames( 'help-center-contact-page__box', 'odie' ) }
								role="button"
								tabIndex={ 0 }
							>
								<div className="help-center-contact-page__box-icon">
									<Icon icon={ comment } />
								</div>
								<div>
									<h2>{ __( 'Wapuu', __i18n_text_domain__ ) }</h2>
									<p>{ __( 'Get an immediate reply using a trained AI', __i18n_text_domain__ ) }</p>
								</div>
							</div>
						</Link>
					) }
				</div>
			</div>
		</div>
	);
};

export const HelpCenterContactButton: FC = () => {
	const { __ } = useI18n();
	const { url, isLoading } = useStillNeedHelpURL();
	const sectionName = useSelector( getSectionName );
	const redirectToWpcom = url === 'https://wordpress.com/help/contact';

	const trackContactButtonClicked = () => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	};

	let to = redirectToWpcom ? { pathname: url } : url;

	if ( isLoading ) {
		to = '';
	}

	return (
		<Link
			to={ to }
			target={ redirectToWpcom ? '_blank' : '_self' }
			onClick={ trackContactButtonClicked }
			className="button help-center-contact-page__button"
		>
			<Icon icon={ comment } />
			<span>{ __( 'Still need help?', __i18n_text_domain__ ) }</span>
		</Link>
	);
};
