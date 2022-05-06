/**
 * External Dependencies
 */
import { Button, HappinessEngineersTray } from '@automattic/components';
import { useHas3PC, useSubmitTicketMutation } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { SitePickerDropDown } from '@automattic/site-picker';
import { TextareaControl, TextControl, CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
/**
 * Internal Dependencies
 */
import './help-center-contact-form.scss';
import { useState } from 'react';
import { STORE_KEY } from '../store';
import { SitePicker } from '../types';
import { BackButton } from './back-button';
import InlineChat from './help-center-inline-chat';
import { SuccessScreen } from './ticket-success-screen';

export const SITE_STORE = 'automattic/site';

const HelpCenterSitePicker: React.FC< SitePicker > = ( { onSelect, siteId } ) => {
	const currentSite = useSelect( ( select ) =>
		select( SITE_STORE ).getSite( window._currentSiteId )
	);

	const otherSite = {
		name: __( 'Other site', 'full-site-editing' ),
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
	};
} = {
	CHAT: {
		formTitle: __( 'Start live chat', 'full-site-editing' ),
		trayText: __( 'Our WordPress experts will be with you right away', 'full-site-editing' ),
		buttonLabel: __( 'Chat with us', 'full-site-editing' ),
	},
	EMAIL: {
		formTitle: __( 'Send us an email', 'full-site-editing' ),
		trayText: __( 'Our WordPress experts will get back to you soon', 'full-site-editing' ),
		buttonLabel: __( 'Email us', 'full-site-editing' ),
	},
	FORUM: {
		formTitle: __( 'Ask in our community forums', 'full-site-editing' ),
		formDisclaimer: __(
			'Please do not provide financial or contact information when submitting this form.',
			'full-site-editing'
		),
		buttonLabel: __( 'Ask in the forums', 'full-site-editing' ),
	},
};

type Mode = 'CHAT' | 'EMAIL' | 'FORUM';
interface ContactFormProps {
	mode: Mode;
	onBackClick: () => void;
	siteId: number | null;
	onPopupOpen?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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

const ContactForm: React.FC< ContactFormProps > = ( { mode, onBackClick } ) => {
	const [ openChat, setOpenChat ] = useState( false );
	const [ contactSuccess, setContactSuccess ] = useState( false );
	const locale = useLocale();
	const { isLoading: submittingTicket, mutateAsync } = useSubmitTicketMutation();
	const { siteId, subject, message, otherSiteURL } = useSelect( ( select ) => {
		return {
			siteId: select( STORE_KEY ).getSiteId(),
			subject: select( STORE_KEY ).getSubject(),
			message: select( STORE_KEY ).getMessage(),
			otherSiteURL: select( STORE_KEY ).getOtherSiteURL(),
		};
	} );
	const { hasCookies, isLoading: loadingCookies } = useHas3PC();

	const isLoading = loadingCookies || submittingTicket;

	const { setSiteId, setOtherSiteURL, setSubject, setMessage, setPopup } = useDispatch( STORE_KEY );

	const formTitles = titles[ mode ];

	function handleCTA( event: React.MouseEvent< HTMLButtonElement > ) {
		switch ( mode ) {
			case 'CHAT': {
				if ( hasCookies ) {
					setOpenChat( true );
					break;
				} else {
					const popup = openPopup( event );
					setPopup( popup );
				}
			}
			case 'EMAIL': {
				mutateAsync( {
					subject: subject ?? '',
					message: message ?? '',
					locale,
					client: 'browser:help-center',
					is_chat_overflow: false,
				} ).then( () => setContactSuccess( true ) );
			}
		}
	}
	if ( openChat ) {
		return <InlineChat />;
	}

	if ( contactSuccess ) {
		return <SuccessScreen onBack={ onBackClick } />;
	}

	return (
		<main className="help-center-contact-form">
			<header>
				<BackButton onClick={ onBackClick } />
			</header>
			<h1 className="help-center-contact-form__site-picker-title">{ formTitles.formTitle }</h1>
			{ formTitles.formDisclaimer && (
				<p className="help-center-contact-form__site-picker-form-warning">
					{ formTitles.formDisclaimer }
				</p>
			) }
			<section>
				<HelpCenterSitePicker onSelect={ setSiteId } siteId={ siteId } />
			</section>
			{ siteId === 0 && (
				<section>
					<TextControl
						label={ __( 'Site address', 'full-site-editing' ) }
						value={ otherSiteURL ?? '' }
						onChange={ setOtherSiteURL }
					/>
				</section>
			) }

			{ [ 'FORUM', 'EMAIL' ].includes( mode ) && (
				<section>
					<TextControl
						label={ __( 'Subject', 'full-site-editing' ) }
						value={ subject ?? '' }
						onChange={ setSubject }
					/>
				</section>
			) }

			<section>
				<TextareaControl
					rows={ 10 }
					label={ __( 'How can we help you today?', 'full-site-editing' ) }
					value={ message ?? '' }
					onChange={ setMessage }
				/>
			</section>

			{ mode === 'FORUM' && (
				<section>
					<CheckboxControl
						checked
						label={ __( 'Don’t display my site’s URL publicly', 'full-site-editing' ) }
						onChange={ noop }
					/>
				</section>
			) }
			<section>
				<Button
					disabled={ isLoading }
					onClick={ handleCTA }
					primary
					className="help-center-contact-form__site-picker-cta"
				>
					{ formTitles.buttonLabel }
				</Button>
			</section>
			{ [ 'CHAT', 'EMAIL' ].includes( mode ) && (
				<section>
					<div className="help-center-contact-form__site-picker-hes-tray">
						<HappinessEngineersTray key="happiness-tray" count={ 2 } shuffled={ false } />
						<p className="help-center-contact-form__site-picker-hes-tray-text">
							{ formTitles.trayText }
						</p>
					</div>
				</section>
			) }
		</main>
	);
};

export default ContactForm;
