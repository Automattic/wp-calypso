/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan } from '@automattic/calypso-products';
import { Spinner, GMClosureNotice } from '@automattic/components';
import { HelpCenterSite } from '@automattic/data-stores';
import { getLanguage, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data';
import { useLoadZendeskMessaging } from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { hasTranslation, sprintf } from '@wordpress/i18n';
import { backup, comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { FC, ReactNode, ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { EMAIL_SUPPORT_LOCALES } from '../constants';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useChatStatus, useShouldRenderEmailOption, useStillNeedHelpURL } from '../hooks';
import { Mail } from '../icons';
import HelpCenterContactSupportOption from './help-center-contact-support-option';
import { HelpCenterActiveTicketNotice } from './help-center-notice';
import { generateContactOnClickEvent } from './utils';
import './help-center-contact-page.scss';

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
	isUserEligible?: boolean;
};

export const HelpCenterContactPage: FC< HelpCenterContactPageProps > = ( {
	hideHeaders = false,
	trackEventName,
	isUserEligible = false,
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
	useLoadZendeskMessaging(
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats,
		isEligibleForChat || hasActiveChats
	);

	const { sectionName, site } = useHelpCenterContext();
	const productSlug = ( site as HelpCenterSite )?.plan?.product_slug;
	const plan = getPlan( productSlug );
	const productId = plan?.getProductId();

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
	}, [ __, locale, isEnglishLocale ] );

	if ( isLoading ) {
		return (
			<div className="help-center__loading">
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

	const renderEmailOption = () => {
		return (
			<div className="help-center-contact-support">
				<Link
					to={ emailUrl }
					onClick={ () => generateContactOnClickEvent( 'email', trackEventName, isUserEligible ) }
				>
					<div
						className={ clsx( 'help-center-contact-support__box', 'email' ) }
						role="button"
						tabIndex={ 0 }
					>
						<div className="help-center-contact-support__box-icon">
							<Icon icon={ <Mail /> } />
						</div>
						<div>
							<h2>{ emailHeaderText }</h2>
							<p>{ __( 'An expert will get back to you soon', __i18n_text_domain__ ) }</p>
						</div>
					</div>
				</Link>
			</div>
		);
	};

	return (
		<div className="help-center-contact-page">
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
				{ renderEmail.render
					? renderEmailOption()
					: site && (
							<HelpCenterContactSupportOption
								sectionName={ sectionName }
								productId={ productId }
								site={ site }
								trackEventName={ trackEventName }
							/>
					  ) }
			</div>
		</div>
	);
};

const HelpCenterFooterButton = ( {
	children,
	buttonTextEventProp,
	redirectTo,
	icon,
}: {
	children: ReactNode;
	buttonTextEventProp: string;
	redirectTo: string;
	icon: ReactElement;
} ) => {
	const { url, isLoading } = useStillNeedHelpURL();
	const helpCenterContext = useHelpCenterContext();
	const sectionName = helpCenterContext.sectionName;
	const redirectToWpcom = url === 'https://wordpress.com/help/contact';
	const navigate = useNavigate();
	const [ isCreatingChat, setIsCreatingChat ] = useState( false );
	const handleContactButtonClicked = ( {
		buttonTextEventProp,
	}: {
		buttonTextEventProp: string;
	} ) => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			button_type: buttonTextEventProp,
		} );
	};

	const redirectionURL = () => {
		if ( buttonTextEventProp === 'Still need help?' ) {
			if ( isLoading ) {
				return '';
			}
			return redirectToWpcom ? { pathname: url } : url;
		}
		return redirectTo;
	};

	const handleClick = async () => {
		setIsCreatingChat( true );
		handleContactButtonClicked( { buttonTextEventProp: buttonTextEventProp } );

		setIsCreatingChat( false );
		const url = redirectionURL();
		navigate( url );
	};

	return (
		<Button
			onClick={ handleClick }
			disabled={ isCreatingChat }
			className="button help-center-contact-page__button"
		>
			<Icon icon={ icon } />
			{ children }
		</Button>
	);
};

export const HelpCenterContactButton: FC = () => {
	const { __ } = useI18n();
	const { data: supportInteractions } = useGetSupportInteractions( 'zendesk', 100, 'resolved' );

	return config.isEnabled( 'help-center-experience' ) &&
		supportInteractions &&
		supportInteractions?.length > 0 ? (
		<>
			<HelpCenterFooterButton
				icon={ comment }
				buttonTextEventProp="Still need help?"
				redirectTo="/odie"
			>
				<span>{ __( 'Still need help?', __i18n_text_domain__ ) }</span>
			</HelpCenterFooterButton>
			<HelpCenterFooterButton
				icon={ backup }
				buttonTextEventProp="History"
				redirectTo="/chat-history"
			>
				{ __( 'History', __i18n_text_domain__ ) }
			</HelpCenterFooterButton>
		</>
	) : (
		<HelpCenterFooterButton
			icon={ comment }
			buttonTextEventProp="Still need help?"
			redirectTo="/odie"
		>
			<span>{ __( 'Still need help?', __i18n_text_domain__ ) }</span>
		</HelpCenterFooterButton>
	);
};
