/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan } from '@automattic/calypso-products';
import { Spinner, GMClosureNotice, FormInputValidation } from '@automattic/components';
import { HelpCenterSelect } from '@automattic/data-stores';
import { getLanguage, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useGetOdieStorage } from '@automattic/odie-client';
import { useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { hasTranslation, sprintf } from '@wordpress/i18n';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { BackButton } from '..';
import {
	useChatStatus,
	useChatWidget,
	useShouldRenderEmailOption,
	useStillNeedHelpURL,
	useZendeskMessaging,
} from '../hooks';
import { Mail } from '../icons';
import { HELP_CENTER_STORE } from '../stores';
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

	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );
	const sectionName = useSelector( getSectionName );
	const currentSite = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.getSite();
	}, [] );

	const wapuuChatId = useGetOdieStorage( 'chat_id' );

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
		const productSlug = ( currentSite as HelpCenterSite )?.plan?.product_slug;
		const plan = getPlan( productSlug );
		const productId = plan?.getProductId();

		const handleOnClick = () => {
			contactOptionsEventMap.chat();

			recordTracksEvent( 'calypso_help_live_chat_begin', {
				site_plan_product_id: productId,
				is_automated_transfer: currentSite?.is_wpcom_atomic,
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );

			openChatWidget( {
				aiChatId: wapuuChatId,
				message: 'Support request started with Wapuu',
				siteUrl: currentSite?.URL,
				onError: () => setHasSubmittingError( true ),
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

				<div className={ classnames( 'help-center-contact-page__boxes' ) }>
					{ renderEmail.render ? renderEmailOption() : renderChatOption() }
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
