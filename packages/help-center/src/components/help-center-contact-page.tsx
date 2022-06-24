/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner } from '@automattic/components';
import { Icon, comment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { BackButton } from '..';
import { useShouldRenderChatOption } from '../hooks/use-should-render-chat-option';
import { useShouldRenderEmailOption } from '../hooks/use-should-render-email-option';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
import Mail from '../icons/mail';
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

	if ( renderChat.isLoading ) {
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
				<h3>{ __( 'Contact our WordPress.com experts' ) }</h3>
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
									<h2>{ __( 'Live chat' ) }</h2>
									<p>
										{ renderChat.state !== 'AVAILABLE'
											? __( 'Chat is unavailable right now' )
											: __( 'Get an immediate reply' ) }
									</p>
								</div>
							</div>
						</ConditionalLink>
					) }
					{ renderEmail && (
						<Link to="/contact-form?mode=EMAIL">
							<div
								className={ classnames( 'help-center-contact-page__box', 'email' ) }
								role="button"
								tabIndex={ 0 }
							>
								<div className="help-center-contact-page__box-icon">
									<Icon icon={ <Mail /> } />
								</div>
								<div>
									<h2>{ __( 'Email' ) }</h2>
									<p>{ __( 'An expert will get back to you soon' ) }</p>
								</div>
							</div>
						</Link>
					) }
				</div>
			</div>
			<SibylArticles />
		</div>
	);
};

export const HelpCenterContactButton: React.FC = () => {
	const { __ } = useI18n();
	const url = useStillNeedHelpURL();
	const sectionName = useSelector( getSectionName );
	const redirectToWpcom = url === 'https://wordpress.com/help/contact';

	const trackContactButtonClicked = () => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			location: 'help-center',
			section: sectionName,
		} );
	};

	return (
		<Link
			to={ redirectToWpcom ? { pathname: url } : url }
			target={ redirectToWpcom ? '_blank' : '_self' }
			onClick={ trackContactButtonClicked }
			className="button help-center-contact-page__button"
		>
			<Icon icon={ comment } />
			<span>{ __( 'Still need help?' ) }</span>
		</Link>
	);
};
