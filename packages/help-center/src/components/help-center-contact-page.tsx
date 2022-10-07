/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner } from '@automattic/components';
import { useEffect } from '@wordpress/element';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { useActiveSupportTicketsQuery } from 'calypso/data/help/use-active-support-tickets-query';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { BackButton } from '..';
import { useShouldRenderChatOption } from '../hooks/use-should-render-chat-option';
import { useShouldRenderEmailOption } from '../hooks/use-should-render-email-option';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
import Mail from '../icons/mail';
import { HelpCenterActiveTicketNotice } from './help-center-notice';
import { SibylArticles } from './help-center-sibyl-articles';

const ConditionalLink: React.FC< { active: boolean } & LinkProps > = ( { active, ...props } ) => {
	if ( active ) {
		return <Link { ...props } />;
	}
	return <span { ...props }></span>;
};

export const HelpCenterContactPage: React.FC = () => {
	const { __ } = useI18n();

	const renderEmail = useShouldRenderEmailOption();
	const renderChat = useShouldRenderChatOption();
	const email = useSelector( getCurrentUserEmail );
	const { data: tickets, isLoading: isLoadingTickets } = useActiveSupportTicketsQuery( email, {
		staleTime: 30 * 60 * 1000,
	} );
	const isLoading = renderChat.isLoading || renderEmail.isLoading || isLoadingTickets;

	useEffect( () => {
		if ( isLoading ) {
			return;
		}
		recordTracksEvent( 'calypso_helpcenter_contact_options_impression', {
			location: 'help-center',
			chat_available: renderChat.state === 'AVAILABLE',
			email_available: renderEmail.render,
		} );
	}, [ isLoading, renderChat.state, renderEmail.render ] );

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
				<HelpCenterActiveTicketNotice tickets={ tickets } />
				<div
					className={ classnames( 'help-center-contact-page__boxes', {
						'is-reversed': ! renderChat.render || renderChat.state !== 'AVAILABLE',
					} ) }
				>
					{ renderChat.render && (
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
									<h2>{ __( 'Live chat', __i18n_text_domain__ ) }</h2>
									<p>
										{ renderChat.state !== 'AVAILABLE'
											? __( 'Chat is unavailable right now', __i18n_text_domain__ )
											: __( 'Get an immediate reply', __i18n_text_domain__ ) }
									</p>
								</div>
							</div>
						</ConditionalLink>
					) }

					{ renderEmail.render && (
						<Link
							// set overflow flag when chat is not available nor closed, and the user is eligible to chat, but still sends a support ticket
							to={ `/contact-form?mode=EMAIL&overflow=${ (
								renderChat.eligible &&
								renderChat.state !== 'CLOSED' &&
								renderChat.state !== 'AVAILABLE'
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
									<h2>{ __( 'Email', __i18n_text_domain__ ) }</h2>
									<p>{ __( 'An expert will get back to you soon', __i18n_text_domain__ ) }</p>
								</div>
							</div>
						</Link>
					) }
				</div>
			</div>
			<SibylArticles articleCanNavigateBack />
		</div>
	);
};

export const HelpCenterContactButton: React.FC = () => {
	const { __ } = useI18n();
	const { url, isLoading } = useStillNeedHelpURL();
	const sectionName = useSelector( getSectionName );
	const redirectToWpcom = url === 'https://wordpress.com/help/contact';

	const trackContactButtonClicked = () => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
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
