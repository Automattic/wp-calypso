/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan } from '@automattic/calypso-products';
import { Spinner, GMClosureNotice, FormInputValidation } from '@automattic/components';
import { getLanguage, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useGetOdieStorage, useSetOdieStorage } from '@automattic/odie-client';
import { useEffect, useMemo } from '@wordpress/element';
import { hasTranslation, sprintf } from '@wordpress/i18n';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { BackButton } from '..';
import { EMAIL_SUPPORT_LOCALES } from '../constants';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import {
	useChatStatus,
	useChatWidget,
	useShouldRenderEmailOption,
	useStillNeedHelpURL,
	useZendeskMessaging,
} from '../hooks';
import { Mail } from '../icons';
import { HelpCenterActiveTicketNotice } from './help-center-notice';
import type { HelpCenterSite } from '@automattic/data-stores';

type ContactOption = 'chat' | 'email';
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
	const renderEmail = useShouldRenderEmailOption();
	const {
		hasActiveChats,
		isEligibleForChat,
		isLoading: isLoadingChatStatus,
		supportActivity,
	} = useChatStatus();
	useZendeskMessaging(
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats,
		isEligibleForChat || hasActiveChats
	);

	const { sectionName, site } = useHelpCenterContext();
	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );

	const wapuuChatId = useGetOdieStorage( 'chat_id' );
	const setWapuuChatId = useSetOdieStorage( 'chat_id' );

	const { isOpeningChatWidget, openChatWidget } = useChatWidget(
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats
	);

	const isLoading = renderEmail.isLoading || isLoadingChatStatus;

	useEffect( () => {
		if ( isLoading ) {
			return;
		}
		recordTracksEvent( 'calypso_helpcenter_contact_options_impression', {
			force_site_id: true,
			location: 'help-center',
			chat_available: ! renderEmail.render,
			email_available: renderEmail.render,
		} );
	}, [ isLoading, renderEmail.render ] );

	const liveChatHeaderText = useMemo( () => {
		if ( isEnglishLocale || ! hasTranslation( 'Contact WordPress.com Support (English)' ) ) {
			return __( 'Contact WordPress.com Support', __i18n_text_domain__ );
		}

		return __( 'Contact WordPress.com Support (English)', __i18n_text_domain__ );
	}, [ __, locale ] );

	const emailHeaderText = useMemo( () => {
		if ( isEnglishLocale ) {
			return __( 'Email', __i18n_text_domain__ );
		}

		const isLanguageSupported = EMAIL_SUPPORT_LOCALES.includes( locale );

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

	if ( isLoading ) {
		return (
			<div className="help-center-contact-page__loading">
				<Spinner baseClassName="" />
			</div>
		);
	}

	// Create URLSearchParams for email
	const emailUrlSearchParams = new URLSearchParams( {
		mode: 'EMAIL',
		// Set overflow flag when chat is not available nor closed, and the user is eligible to chat, but still sends a support ticket
		overflow: renderEmail.render.toString(),
		wapuuFlow: hideHeaders.toString(),
	} );
	const emailUrl = `/contact-form?${ emailUrlSearchParams.toString() }`;

	const contactOptionsEventMap: Record< ContactOption, () => void > = {
		chat: generateContactOnClickEvent( 'chat', trackEventName ),
		email: generateContactOnClickEvent( 'email', trackEventName ),
	};

	const renderChatOption = () => {
		const productSlug = ( site as HelpCenterSite )?.plan?.product_slug;
		const plan = getPlan( productSlug );
		const productId = plan?.getProductId();

		const handleOnClick = () => {
			contactOptionsEventMap.chat();

			recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
				support_variation: 'messaging',
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );

			recordTracksEvent( 'calypso_help_live_chat_begin', {
				site_plan_product_id: productId,
				is_automated_transfer: site?.is_wpcom_atomic,
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );

			let message = '';
			const escapedWapuuChatId = encodeURIComponent( wapuuChatId || '' );

			if ( wapuuChatId ) {
				message += `Support request started with <strong>Wapuu</strong><br />Wapuu Chat: <a href="https://mc.a8c.com/odie/odie-chat.php?chat_id=${ escapedWapuuChatId }">${ escapedWapuuChatId }</a><br />`;
			}

			if ( site?.URL ) {
				message += `Site: ${ encodeURIComponent( site?.URL || '' ) }<br />`;
			}

			openChatWidget( {
				aiChatId: escapedWapuuChatId,
				message: message,
				siteUrl: site?.URL,
				onError: () => setHasSubmittingError( true ),
				// Reset Odie chat after passing to support
				onSuccess: () => setWapuuChatId( null ),
			} );
		};

		return (
			<div>
				<button disabled={ isOpeningChatWidget } onClick={ handleOnClick }>
					<div className="help-center-contact-page__box chat" role="button" tabIndex={ 0 }>
						<div className="help-center-contact-page__box-icon">
							<Icon icon={ comment } />
						</div>
						<div>
							<h2>{ liveChatHeaderText }</h2>
							<p>{ __( 'Our Happiness team will get back to you soon', __i18n_text_domain__ ) }</p>
						</div>
					</div>
				</button>
				{ hasSubmittingError && (
					<FormInputValidation
						isError
						text={ __( 'Something went wrong, please try again later.', __i18n_text_domain__ ) }
					/>
				) }
			</div>
		);
	};

	const renderEmailOption = () => {
		return (
			<Link to={ emailUrl } onClick={ contactOptionsEventMap[ 'email' ] }>
				<div
					className={ clsx( 'help-center-contact-page__box', 'email' ) }
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
		);
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
					enabled={ ! renderEmail.render }
				/>

				<div className={ clsx( 'help-center-contact-page__boxes' ) }>
					{ renderEmail.render ? renderEmailOption() : renderChatOption() }
				</div>
			</div>
		</div>
	);
};

export const HelpCenterContactButton: FC = () => {
	const { __ } = useI18n();
	const { url, isLoading } = useStillNeedHelpURL();
	const helpCenterContext = useHelpCenterContext();
	const sectionName = helpCenterContext.sectionName;
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
