/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, FormInputValidation, Popover } from '@automattic/components';
import {
	useSiteAnalysis,
	useUserSites,
	AnalysisReport,
	useSibylQuery,
	SiteDetails,
	HelpCenterSite,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { TextControl, CheckboxControl, Tip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { useContactFormCTA } from '../hooks/use-contact-form-cta';
import { useContactFormTitle } from '../hooks/use-contact-form-title';
import { HELP_CENTER_STORE } from '../stores';
import { getSupportVariationFromMode } from '../support-variations';
import { Mode } from '../types';
import { BackButton } from './back-button';
import { SibylArticles } from './help-center-sibyl-articles';
import { HelpCenterSitePicker } from './help-center-site-picker';
import './help-center-contact-form.scss';

export const SITE_STORE = 'automattic/site';

const fakeFaces = [
	'john',
	'joe',
	'julia',
	'emily',
	'ashley',
	'daphne',
	'megan',
	'omar',
	'vivian',
	'sam',
	'tony',
].map( ( name ) => `https://s0.wp.com/i/support-engineers/${ name }.jpg` );
const randomTwoFaces = fakeFaces.sort( () => Math.random() - 0.5 ).slice( 0, 2 );

const getSupportedLanguages = ( supportType: string, locale: string ) => {
	const isLiveChatLanguageSupported = (
		config( 'livechat_support_locales' ) as Array< string >
	 ).includes( locale );

	const isLanguageSupported = ( config( 'upwork_support_locales' ) as Array< string > ).includes(
		locale
	);

	switch ( supportType ) {
		case 'CHAT':
			return ! isLiveChatLanguageSupported;
		case 'EMAIL':
			return ! isLanguageSupported && ! [ 'en', 'en-gb' ].includes( locale );

		default:
			return false;
	}
};

export const HelpCenterContactForm = () => {
	const { search } = useLocation();
	const sectionName = useSelector( getSectionName );
	const params = new URLSearchParams( search );
	const mode = params.get( 'mode' ) as Mode;
	const [ hideSiteInfo, setHideSiteInfo ] = useState( false );
	const locale = useLocale();
	const userId = useSelector( getCurrentUserId );
	const { data: userSites } = useUserSites( userId );
	const userWithNoSites = userSites?.sites.length === 0;
	const [ sitePickerChoice, setSitePickerChoice ] = useState< 'CURRENT_SITE' | 'OTHER_SITE' >(
		'CURRENT_SITE'
	);
	const { currentSite, subject, message, userDeclaredSiteUrl } = useSelect( ( select ) => {
		return {
			currentSite: select( HELP_CENTER_STORE ).getSite(),
			subject: select( HELP_CENTER_STORE ).getSubject(),
			message: select( HELP_CENTER_STORE ).getMessage(),
			userDeclaredSiteUrl: select( HELP_CENTER_STORE ).getUserDeclaredSiteUrl(),
		};
	} );

	const { setUserDeclaredSite, setSubject, setMessage } = useDispatch( HELP_CENTER_STORE );
	const formTitles = useContactFormTitle( mode );

	useEffect( () => {
		const supportVariation = getSupportVariationFromMode( mode );
		recordTracksEvent( 'calypso_inlinehelp_contact_view', {
			support_variation: supportVariation,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	}, [ mode, sectionName ] );

	useEffect( () => {
		if ( userWithNoSites ) {
			setSitePickerChoice( 'OTHER_SITE' );
		}
	}, [ userWithNoSites ] );

	let ownershipResult: AnalysisReport = useSiteAnalysis(
		// pass user email as query cache key
		userId,
		userDeclaredSiteUrl,
		sitePickerChoice === 'OTHER_SITE'
	);

	// if the user picked a site from the picker, we don't need to analyze the ownership
	if ( currentSite && sitePickerChoice === 'CURRENT_SITE' ) {
		ownershipResult = {
			result: 'OWNED_BY_USER',
			isWpcom: true,
			siteURL: currentSite.URL,
			site: currentSite,
		};
	}

	// record the resolved site
	useEffect( () => {
		if ( ownershipResult?.site && sitePickerChoice === 'OTHER_SITE' ) {
			setUserDeclaredSite( ownershipResult?.site as SiteDetails );
		}
	}, [ ownershipResult, setUserDeclaredSite, sitePickerChoice ] );

	let supportSite: SiteDetails | HelpCenterSite;

	// if the user picked "other site", force them to declare a site
	if ( sitePickerChoice === 'OTHER_SITE' ) {
		supportSite = ownershipResult?.site as SiteDetails;
	} else {
		supportSite = currentSite as HelpCenterSite;
	}

	const [ debouncedMessage ] = useDebounce( message || '', 500 );

	const { data: sibylArticles } = useSibylQuery(
		debouncedMessage,
		Boolean( supportSite?.jetpack ),
		Boolean( supportSite?.is_wpcom_atomic )
	);

	const showingSibylResults = params.get( 'show-results' ) === 'true';

	const InfoTip = () => {
		const ref = useRef< HTMLButtonElement >( null );
		const [ isOpen, setOpen ] = useState( false );

		return (
			<>
				<button
					className="help-center-contact-form__site-picker-forum-privacy-info"
					ref={ ref }
					aria-haspopup
					aria-label={ __( 'More information' ) }
					onClick={ () => setOpen( ! isOpen ) }
				>
					<Icon icon={ info } size={ 18 } />
				</button>
				<Popover
					className="help-center-contact-form__site-picker-privacy-popover"
					isVisible={ isOpen }
					context={ ref.current }
					position="top left"
				>
					<span className="help-center-contact-form__site-picker-forum-privacy-popover">
						{ __(
							"This may result in a longer response time, but WordPress.com staff in the forums will still be able to view your site's URL.",
							__i18n_text_domain__
						) }
					</span>
				</Popover>
			</>
		);
	};

	const shouldShowHelpLanguagePrompt = getSupportedLanguages( mode, locale );

	const { handleCTA, isCTADisabled, isSubmitting, hasSubmittingError } = useContactFormCTA(
		mode,
		supportSite as HelpCenterSite,
		sectionName,
		ownershipResult,
		hideSiteInfo,
		params
	);

	const getCTALabel = () => {
		if ( ! showingSibylResults && sibylArticles && sibylArticles.length > 0 ) {
			return __( 'Continue', __i18n_text_domain__ );
		}

		if ( mode === 'CHAT' && showingSibylResults ) {
			return __( 'Still chat with us', __i18n_text_domain__ );
		}

		if ( mode === 'EMAIL' && showingSibylResults ) {
			return __( 'Still email us', __i18n_text_domain__ );
		}

		if ( ownershipResult?.result === 'LOADING' ) {
			return formTitles.buttonLoadingLabel;
		}

		return isSubmitting ? formTitles.buttonSubmittingLabel : formTitles.buttonLabel;
	};

	return showingSibylResults ? (
		<div className="help-center__sibyl-articles-page">
			<BackButton />
			<SibylArticles
				title={ __( 'These are some helpful articles', __i18n_text_domain__ ) }
				supportSite={ supportSite }
				message={ message }
				articleCanNavigateBack
			/>
			<section className="contact-form-submit">
				<Button
					disabled={ isCTADisabled() }
					onClick={ handleCTA }
					primary
					className="help-center-contact-form__site-picker-cta"
				>
					{ getCTALabel() }
				</Button>
				{ hasSubmittingError && (
					<FormInputValidation
						isError
						text={ __( 'Something went wrong, please try again later.', __i18n_text_domain__ ) }
					/>
				) }
			</section>
		</div>
	) : (
		<main className="help-center-contact-form">
			<BackButton />
			<h1 className="help-center-contact-form__site-picker-title">{ formTitles.formTitle }</h1>

			{ formTitles.formDisclaimer && (
				<p className="help-center-contact-form__site-picker-form-warning">
					{ formTitles.formDisclaimer }
				</p>
			) }

			{ ! userWithNoSites && (
				<HelpCenterSitePicker
					ownershipResult={ ownershipResult }
					sitePickerChoice={ sitePickerChoice }
					setSitePickerChoice={ setSitePickerChoice }
					currentSite={ currentSite }
					siteId={ sitePickerChoice === 'CURRENT_SITE' ? currentSite?.ID : 0 }
					enabled={ mode === 'FORUM' }
				/>
			) }

			{ [ 'FORUM', 'EMAIL' ].includes( mode ) && (
				<section>
					<TextControl
						className="help-center-contact-form__subject"
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
					onInput={ ( event ) => setMessage( event.currentTarget.value ) }
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

			<section className="contact-form-submit">
				<Button
					disabled={ isCTADisabled() }
					onClick={ handleCTA }
					primary
					className="help-center-contact-form__site-picker-cta"
				>
					{ getCTALabel() }
				</Button>
				{ ! hasSubmittingError && shouldShowHelpLanguagePrompt && (
					<Tip>{ __( 'Note: Support is only available in English at the moment.' ) }</Tip>
				) }
				{ hasSubmittingError && (
					<FormInputValidation
						isError
						text={ __( 'Something went wrong, please try again later.', __i18n_text_domain__ ) }
					/>
				) }
			</section>
			{ [ 'CHAT', 'EMAIL' ].includes( mode ) && (
				<section>
					<div className="help-center-contact-form__site-picker-hes-tray">
						{ randomTwoFaces.map( ( f ) => (
							<img key={ f } src={ f } aria-hidden="true" alt=""></img>
						) ) }
						<p className="help-center-contact-form__site-picker-hes-tray-text">
							{ formTitles.trayText }
						</p>
					</div>
				</section>
			) }
			<SibylArticles supportSite={ supportSite } message={ message } articleCanNavigateBack />
		</main>
	);
};
