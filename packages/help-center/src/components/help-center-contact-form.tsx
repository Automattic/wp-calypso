/**
 * External Dependencies
 */
import { Button, Popover } from '@automattic/components';
import {
	useHas3PC,
	useSubmitTicketMutation,
	useSubmitForumsMutation,
	useSiteAnalysis,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { SitePickerDropDown } from '@automattic/site-picker';
import { TextControl, CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info, commentContent } from '@wordpress/icons';
import React, { useEffect, useState, useContext } from 'react';
/**
 * Internal Dependencies
 */
import { HelpCenterContext } from '../help-center-context';
import { STORE_KEY } from '../store';
import { SitePicker } from '../types';
import { BackButton } from './back-button';
import InlineChat from './help-center-inline-chat';
import { HelpCenterOwnershipNotice } from './help-center-notice';
import { SibylArticles } from './help-center-sibyl-articles';
import { SuccessScreen } from './ticket-success-screen';
import './help-center-contact-form.scss';

export const SITE_STORE = 'automattic/site';

const fakeFaces = Array.from(
	{ length: 10 },
	( _, index ) => `https://s0.wp.com/i/fake-faces/face-${ index }.jpg`
);
const randomTwoFaces = fakeFaces.sort( () => Math.random() - 0.5 ).slice( 0, 2 );

const HelpCenterSitePicker: React.FC< SitePicker > = ( { onSelect, currentSite, siteId } ) => {
	const otherSite = {
		name: __( 'Other site', __i18n_text_domain__ ),
		ID: 0,
		logo: { id: '', sizes: [], url: '' },
		URL: '',
	};

	function pickSite( ID: number ) {
		onSelect( ID );
	}

	const options = [ currentSite, otherSite ];

	return <SitePickerDropDown onPickSite={ pickSite } options={ options } siteId={ siteId } />;
};

const titles: {
	[ key: string ]: {
		formTitle: string;
		trayText?: string;
		formDisclaimer?: string;
		buttonLabel: string;
		buttonLoadingLabel: string;
	};
} = {
	CHAT: {
		formTitle: __( 'Start live chat', __i18n_text_domain__ ),
		trayText: __( 'Our WordPress experts will be with you right away', __i18n_text_domain__ ),
		buttonLabel: __( 'Chat with us', __i18n_text_domain__ ),
		buttonLoadingLabel: __( 'Connecting to chat', __i18n_text_domain__ ),
	},
	EMAIL: {
		formTitle: __( 'Send us an email', __i18n_text_domain__ ),
		trayText: __( 'Our WordPress experts will get back to you soon', __i18n_text_domain__ ),
		buttonLabel: __( 'Email us', __i18n_text_domain__ ),
		buttonLoadingLabel: __( 'Sending email', __i18n_text_domain__ ),
	},
	FORUM: {
		formTitle: __( 'Ask in our community forums', __i18n_text_domain__ ),
		formDisclaimer: __(
			'Please do not provide financial or contact information when submitting this form.',
			__i18n_text_domain__
		),
		buttonLabel: __( 'Ask in the forums', __i18n_text_domain__ ),
		buttonLoadingLabel: __( 'Posting in the forums', __i18n_text_domain__ ),
	},
};

type Mode = 'CHAT' | 'EMAIL' | 'FORUM';
interface ContactFormProps {
	mode: Mode;
	onBackClick: () => void;
	onGoHome: () => void;
	siteId: number | null;
	onPopupOpen?: () => void;
}

const POPUP_TOP_BAR_HEIGHT = 60;

function openPopup( event: React.MouseEvent< HTMLButtonElement > ): Window {
	const helpCenterContainer = event.currentTarget.closest(
		'.help-center__container'
	) as HTMLDivElement;

	const HCRect = helpCenterContainer.getBoundingClientRect();
	const windowTop = event.screenY - event.clientY;

	const popupTop = windowTop + HCRect.top - POPUP_TOP_BAR_HEIGHT;
	const popupLeft = window.screenLeft + HCRect.left;
	const popupWidth = HCRect.width;
	const popupHeight = HCRect.height - POPUP_TOP_BAR_HEIGHT;

	const popup = window.open(
		'https://widgets.wp.com/calypso-happychat/',
		'happy-chat-window',
		`toolbar=no,scrollbars=yes,location=no,addressbar=no,width=${ popupWidth },height=${ popupHeight },left=${ popupLeft },top=${ popupTop }`
	) as Window;

	return popup;
}

const ContactForm: React.FC< ContactFormProps > = ( { mode, onBackClick, onGoHome } ) => {
	const [ openChat, setOpenChat ] = useState( false );
	const [ contactSuccess, setContactSuccess ] = useState( false );
	const [ forumTopicUrl, setForumTopicUrl ] = useState( '' );
	const [ hideSiteInfo, setHideSiteInfo ] = useState( false );
	const locale = useLocale();
	const { isLoading: submittingTicket, mutateAsync: submitTicket } = useSubmitTicketMutation();
	const { isLoading: submittingTopic, mutateAsync: submitTopic } = useSubmitForumsMutation();
	const [ sitePickerChoice, setSitePickerChoice ] = useState< 'CURRENT_SITE' | 'OTHER_SITE' >(
		'CURRENT_SITE'
	);
	const { setHeaderText } = useContext( HelpCenterContext );
	const { selectedSite, subject, message, userDeclaredSiteUrl } = useSelect( ( select ) => {
		return {
			selectedSite: select( STORE_KEY ).getSite(),
			subject: select( STORE_KEY ).getSubject(),
			message: select( STORE_KEY ).getMessage(),
			userDeclaredSiteUrl: select( STORE_KEY ).getUserDeclaredSiteUrl(),
		};
	} );

	const {
		setSite,
		resetStore,
		setUserDeclaredSiteUrl,
		setUserDeclaredSite,
		setSubject,
		setMessage,
		setPopup,
	} = useDispatch( STORE_KEY );

	const {
		result: ownershipResult,
		isLoading: isAnalysisLoading,
		site: userDeclaredSite,
	} = useSiteAnalysis( userDeclaredSiteUrl );

	// record the resolved site
	useEffect( () => {
		if ( userDeclaredSite ) {
			setUserDeclaredSite( userDeclaredSite );
		}
	}, [ userDeclaredSite, setUserDeclaredSite ] );

	useEffect( () => {
		switch ( mode ) {
			case 'CHAT':
				if ( openChat ) {
					setHeaderText(
						<>
							<Icon icon={ commentContent } />
							{ __( 'Live chat', __i18n_text_domain__ ) }
						</>
					);
				} else {
					setHeaderText( __( 'Start live chat', __i18n_text_domain__ ) );
				}
				break;
			case 'EMAIL':
				setHeaderText( __( 'Send us an email', __i18n_text_domain__ ) );
				break;
			case 'FORUM':
				setHeaderText( __( 'Ask in our community forums', __i18n_text_domain__ ) );
				break;
		}
	}, [ mode, openChat, setHeaderText ] );

	const { hasCookies, isLoading: loadingCookies } = useHas3PC();

	const isSubmitting = submittingTicket || submittingTopic;
	const isLoading = loadingCookies || isSubmitting;

	const formTitles = titles[ mode ];

	const currentSite = useSelect( ( select ) =>
		select( SITE_STORE ).getSite( window._currentSiteId )
	);

	let supportSite: typeof currentSite;

	// if the user picked "other site", force them to declare a site
	if ( sitePickerChoice === 'OTHER_SITE' ) {
		supportSite = userDeclaredSite;
	} else {
		supportSite = selectedSite || currentSite;
	}

	function handleCTA( event: React.MouseEvent< HTMLButtonElement > ) {
		switch ( mode ) {
			case 'CHAT': {
				if ( supportSite ) {
					if ( hasCookies ) {
						setOpenChat( true );
						break;
					} else {
						const popup = openPopup( event );
						setPopup( popup );
					}
				}
				break;
			}
			case 'EMAIL': {
				if ( supportSite ) {
					const ticketMeta = [
						'Site I need help with: ' + supportSite?.URL,
						'Plan: ' + supportSite?.plan?.product_slug,
					];

					const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

					submitTicket( {
						subject: subject ?? '',
						message: kayakoMessage,
						locale,
						client: 'browser:help-center',
						is_chat_overflow: false,
					} ).then( () => {
						setContactSuccess( true );
						resetStore();
					} );
				}
				break;
			}
			case 'FORUM': {
				submitTopic( {
					site: supportSite,
					message: message ?? '',
					subject: subject ?? '',
					locale,
					hideInfo: hideSiteInfo,
					userDeclaredSiteUrl,
				} ).then( ( response ) => {
					setForumTopicUrl( response.topic_URL );
					resetStore();
				} );
				break;
			}
		}
	}
	if ( openChat ) {
		return <InlineChat />;
	}

	if ( contactSuccess || forumTopicUrl ) {
		return <SuccessScreen forumTopicUrl={ forumTopicUrl } onBack={ onGoHome } />;
	}

	const InfoTip = () => {
		const [ ref, setRef ] = useState< any >();
		const [ isOpen, setOpen ] = useState( false );

		return (
			<>
				<Button
					borderless
					ref={ ( reference ) => ref !== reference && setRef( reference ) }
					aria-haspopup
					aria-label={ __( 'More information' ) }
					onClick={ () => setOpen( ! isOpen ) }
				>
					<Icon icon={ info } size={ 18 } />
				</Button>
				<Popover isVisible={ isOpen } context={ ref } position="top left">
					<span>
						This may result in a longer response time,
						<br />
						but WordPress.com staff in the forums will
						<br />
						still be able to view your site's URL.
					</span>
				</Popover>
			</>
		);
	};

	const isCTADisabled = () => {
		return isLoading || ( mode !== 'FORUM' && ! supportSite ) || ! message;
	};

	return (
		<main className="help-center-contact-form">
			<header>
				{ /* forum users don't have other support options, send them back to home, not the support options screen */ }
				<BackButton onClick={ mode === 'FORUM' ? onGoHome : onBackClick } />
			</header>
			<h1 className="help-center-contact-form__site-picker-title">{ formTitles.formTitle }</h1>
			{ formTitles.formDisclaimer && (
				<p className="help-center-contact-form__site-picker-form-warning">
					{ formTitles.formDisclaimer }
				</p>
			) }
			<section>
				<HelpCenterSitePicker
					currentSite={ currentSite }
					onSelect={ ( id: string | number ) => {
						if ( id !== 0 ) {
							setSite( currentSite );
						}
						setSitePickerChoice( id === 0 ? 'OTHER_SITE' : 'CURRENT_SITE' );
					} }
					siteId={ sitePickerChoice === 'CURRENT_SITE' ? currentSite?.ID : 0 }
				/>
			</section>
			{ sitePickerChoice === 'OTHER_SITE' && (
				<>
					<section>
						<TextControl
							label={ __( 'Site address', __i18n_text_domain__ ) }
							value={ userDeclaredSiteUrl ?? '' }
							onChange={ setUserDeclaredSiteUrl }
						/>
					</section>
					{ ownershipResult && (
						<HelpCenterOwnershipNotice
							ownershipResult={ ownershipResult }
							isAnalysisLoading={ isAnalysisLoading }
							userDeclaredSite={ userDeclaredSite }
						/>
					) }
				</>
			) }

			{ [ 'FORUM', 'EMAIL' ].includes( mode ) && (
				<section>
					<TextControl
						label={ __( 'Subject', __i18n_text_domain__ ) }
						value={ subject ?? '' }
						onChange={ setSubject }
					/>
				</section>
			) }

			<section>
				<label
					className="help-center-contact-form__label"
					htmlFor="help-center-contact-form__message"
				>
					{ __( 'How can we help you today?', __i18n_text_domain__ ) }
				</label>
				<textarea
					id="help-center-contact-form__message"
					rows={ 10 }
					value={ message ?? '' }
					onChange={ ( event ) => setMessage( event.target.value ) }
					className="help-center-contact-form__message"
				/>
			</section>

			{ mode === 'FORUM' && (
				<section>
					<div className="help-center-contact-form__domain-sharing">
						<CheckboxControl
							checked={ hideSiteInfo }
							label={ __( 'Don’t display my site’s URL publicly', __i18n_text_domain__ ) }
							help={ <InfoTip /> }
							onChange={ ( value ) => setHideSiteInfo( value ) }
						/>
					</div>
				</section>
			) }
			<section>
				<Button
					disabled={ isCTADisabled() }
					onClick={ handleCTA }
					primary
					className="help-center-contact-form__site-picker-cta"
				>
					{ isSubmitting ? formTitles.buttonLoadingLabel : formTitles.buttonLabel }
				</Button>
			</section>
			{ [ 'CHAT', 'EMAIL' ].includes( mode ) && (
				<section>
					<div className="help-center-contact-form__site-picker-hes-tray">
						{ randomTwoFaces.map( ( f ) => (
							<img src={ f } aria-hidden="true" alt=""></img>
						) ) }
						<p className="help-center-contact-form__site-picker-hes-tray-text">
							{ formTitles.trayText }
						</p>
					</div>
				</section>
			) }
			<SibylArticles supportSite={ supportSite } message={ message } />
		</main>
	);
};

export default ContactForm;
