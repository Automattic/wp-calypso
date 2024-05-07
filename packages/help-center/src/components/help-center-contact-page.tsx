/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner, GMClosureNotice } from '@automattic/components';
import { useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useEffect, useMemo } from '@wordpress/element';
import { hasTranslation } from '@wordpress/i18n';
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
	useShouldRenderChatOption,
	useStillNeedHelpURL,
	useZendeskMessaging,
} from '../hooks';
import { Forum } from '../icons';
import { HelpCenterActiveTicketNotice } from './help-center-notice';

const ConditionalLink: FC< { active: boolean } & LinkProps > = ( { active, ...props } ) => {
	if ( active ) {
		return <Link { ...props } />;
	}
	return <span { ...props }></span>;
};

type ContactOption = 'chat' | 'forum';
const generateContactOnClickEvent = (
	contactOption: ContactOption,
	contactOptionEventName?: string
): ( () => void ) => {
	return () => {
		if ( contactOptionEventName ) {
			recordTracksEvent( contactOptionEventName, {
				location: 'help-center',
				contact_option: contactOption,
			} );
		}
	};
};

/**
 * This component is used to render the contact page in the help center.
 * It will render the contact options based on the user's eligibility.
 * @param hideHeaders - Whether to hide the headers or not (mainly used for embedding the contact page)
 * @param onClick - Callback to be called when the user clicks on a contact option
 * @param trackEventName - The name of the event to be tracked when the user clicks on a contact option
 *
 * Note: onClick and trackEventName should be both defined, in order to track the event and perform the callback.
 */
type HelpCenterContactPageProps = {
	hideHeaders?: boolean;
	onClick?: () => void;
	trackEventName?: string;
};

export const HelpCenterContactPage: FC< HelpCenterContactPageProps > = ( {
	hideHeaders = false,
	trackEventName,
} ) => {
	const { __ } = useI18n();
	const locale = useLocale();
	const isEnglishLocale = useIsEnglishLocale();
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
	const isLoading = isLoadingChatStatus;

	useEffect( () => {
		if ( isLoading ) {
			return;
		}
		recordTracksEvent( 'calypso_helpcenter_contact_options_impression', {
			force_site_id: true,
			location: 'help-center',
			chat_available: renderChat.state === 'AVAILABLE',
		} );
	}, [ isLoading, renderChat.state ] );

	const liveChatHeaderText = useMemo( () => {
		if ( isEnglishLocale || ! hasTranslation( 'Live chat (English)' ) ) {
			return __( 'Live chat', __i18n_text_domain__ );
		}

		return __( 'Live chat (English)', __i18n_text_domain__ );
	}, [ __, locale ] );

	const forumHeaderText = useMemo( () => {
		if ( isEnglishLocale ) {
			return __( 'Community forums', __i18n_text_domain__ );
		}
		return __( 'Community forums (English)', __i18n_text_domain__ );
	}, [ __, locale ] );

	if ( isLoading ) {
		return (
			<div className="help-center-contact-page__loading">
				<Spinner baseClassName="" />
			</div>
		);
	}

	// Create URLSearchParams for forum
	const forumUrlSearchParams = new URLSearchParams( {
		mode: 'FORUM',
		wapuuFlow: hideHeaders.toString(),
	} );
	const forumUrl = `/contact-form?${ forumUrlSearchParams.toString() }`;

	// Create URLSearchParams for chat
	const chatUrlSearchParams = new URLSearchParams( {
		mode: 'CHAT',
		wapuuFlow: hideHeaders.toString(),
	} );
	const chatUrl = `/contact-form?${ chatUrlSearchParams.toString() }`;
	const contactOptionsEventMap: Record< ContactOption, () => void > = {
		chat: generateContactOnClickEvent( 'chat', trackEventName ),
		forum: generateContactOnClickEvent( 'forum', trackEventName ),
	};

	return (
		<div className="help-center-contact-page">
			{ ! hideHeaders && <BackButton /> }
			<div className="help-center-contact-page__content">
				{ ! hideHeaders && (
					<h3>{ __( 'Contact our WordPress.com experts', __i18n_text_domain__ ) }</h3>
				) }
				{ supportActivity && <HelpCenterActiveTicketNotice tickets={ supportActivity } /> }
				<GMClosureNotice
					displayAt="2023-12-26 00:00Z"
					closesAt="2023-12-31 00:00Z"
					reopensAt="2024-01-02 07:00Z"
					enabled={ renderChat.render }
				/>

				<div className={ classnames( 'help-center-contact-page__boxes' ) }>
					<Link to={ forumUrl } onClick={ contactOptionsEventMap[ 'forum' ] }>
						<div
							className={ classnames( 'help-center-contact-page__box', 'forum' ) }
							role="button"
							tabIndex={ 0 }
						>
							<div className="help-center-contact-page__box-icon">
								<Icon icon={ <Forum /> } />
							</div>
							<div>
								<h2>{ forumHeaderText }</h2>
								<p>
									{ __( 'Your question and any answers will be public', __i18n_text_domain__ ) }
								</p>
							</div>
						</div>
					</Link>

					{ renderChat.render && (
						<div className={ classnames( { disabled: renderChat.state !== 'AVAILABLE' } ) }>
							<ConditionalLink
								active={ renderChat.state === 'AVAILABLE' }
								to={ chatUrl }
								onClick={ contactOptionsEventMap[ 'chat' ] }
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
