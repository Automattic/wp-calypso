/**
 * External Dependencies
 */
import { Button, Gridicon, HappinessEngineersTray } from '@automattic/components';
import { SitePickerDropDown } from '@automattic/site-picker';
import { TextareaControl, TextControl, CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { STORE_KEY } from '../store';
import { SitePicker } from '../types';
import InlineChat from './help-center-inline-chat';
/**
 * Internal Dependencies
 */
import type { SitePickerSite } from '@automattic/site-picker';

import './help-center-contact-form.scss';

export const SITE_STORE = 'automattic/site';

const thirdPartyCookiesAvailable = true;

const HelpCenterSitePicker: React.FC< SitePicker > = ( { onSelect, siteId } ) => {
	const site: SitePickerSite | undefined | null = useSelect( ( select ) => {
		if ( siteId ) {
			return select( SITE_STORE ).getSite( siteId );
		}
		return null;
	} );

	const otherSite = {
		name: __( 'Other site', 'full-site-editing' ),
		ID: 0,
		logo: { id: '', sizes: [], url: '' },
		URL: '',
	};

	function pickSite( ID: number ) {
		onSelect( ID );
	}

	if ( ! site ) {
		return null;
	}

	if ( ! siteId && siteId !== 0 ) {
		return null;
	}

	const options = [ site, otherSite ];

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
	const { siteId, subject, message, otherSiteURL } = useSelect( ( select ) => {
		return {
			siteId: select( STORE_KEY ).getSiteId(),
			subject: select( STORE_KEY ).getSubject(),
			message: select( STORE_KEY ).getMessage(),
			otherSiteURL: select( STORE_KEY ).getOtherSiteURL(),
		};
	} );

	const { setSiteId, setOtherSiteURL, setSubject, setMessage, setPopup } = useDispatch( STORE_KEY );

	const formTitles = titles[ mode ];

	function handleCTA( event: React.MouseEvent< HTMLButtonElement > ) {
		switch ( mode ) {
			case 'CHAT': {
				if ( thirdPartyCookiesAvailable ) {
					setOpenChat( true );
					break;
				} else {
					const popup = openPopup( event );
					setPopup( popup );
				}
			}
		}
	}
	if ( openChat ) {
		return <InlineChat />;
	}

	return (
		<main className="help-center-contact-form">
			<header>
				<Button borderless={ true } onClick={ onBackClick }>
					<Gridicon icon={ 'chevron-left' } size={ 18 } />
					{ __( 'Back', 'full-site-editing' ) }
				</Button>
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
				<Button onClick={ handleCTA } primary className="help-center-contact-form__site-picker-cta">
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
