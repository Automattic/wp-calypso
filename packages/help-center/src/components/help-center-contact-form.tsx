/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan, getPlanTermLabel, isFreePlanProduct } from '@automattic/calypso-products';
import { Button, FormInputValidation, Popover } from '@automattic/components';
import {
	useSubmitTicketMutation,
	useSubmitForumsMutation,
	useSiteAnalysis,
	useUserSites,
	AnalysisReport,
	useSibylQuery,
	SiteDetails,
	HelpCenterSite,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { SitePickerDropDown, SitePickerSite } from '@automattic/site-picker';
import { TextControl, CheckboxControl, Tip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { getQueryArgs } from 'calypso/lib/query-args';
import { getCurrentUserEmail, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { HELP_CENTER_STORE } from '../stores';
import { getSupportVariationFromMode } from '../support-variations';
import { SitePicker } from '../types';
import { BackButton } from './back-button';
import { HelpCenterOwnershipNotice } from './help-center-notice';
import { SibylArticles } from './help-center-sibyl-articles';
import type { HelpCenterSelect } from '@automattic/data-stores';
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

const HelpCenterSitePicker: React.FC< SitePicker > = ( {
	onSelect,
	currentSite,
	siteId,
	enabled,
} ) => {
	const otherSite = {
		name: __( 'Other site', __i18n_text_domain__ ),
		ID: 0,
		logo: { id: '', sizes: [] as never[], url: '' },
		URL: '',
	} as const;

	function pickSite( ID: number | string ) {
		onSelect( ID );
	}

	const options: ( SitePickerSite | undefined )[] = [ currentSite, otherSite ];

	return (
		<SitePickerDropDown
			enabled={ enabled }
			onPickSite={ pickSite }
			options={ options }
			siteId={ siteId }
		/>
	);
};

function useFormTitles( mode: Mode ): {
	formTitle: string;
	formSubtitle?: string;
	trayText?: string;
	formDisclaimer?: string;
	buttonLabel: string;
	buttonSubmittingLabel: string;
	buttonLoadingLabel?: string;
} {
	return {
		CHAT: {
			formTitle: __( 'Start live chat', __i18n_text_domain__ ),
			trayText: __( 'Our WordPress experts will be with you right away', __i18n_text_domain__ ),
			buttonLabel: __( 'Chat with us', __i18n_text_domain__ ),
			buttonSubmittingLabel: __( 'Connecting to chat', __i18n_text_domain__ ),
		},
		EMAIL: {
			formTitle: __( 'Send us an email', __i18n_text_domain__ ),
			trayText: __( 'Our WordPress experts will get back to you soon', __i18n_text_domain__ ),
			buttonLabel: __( 'Email us', __i18n_text_domain__ ),
			buttonSubmittingLabel: __( 'Sending email', __i18n_text_domain__ ),
		},
		FORUM: {
			formTitle: __( 'Ask in our community forums', __i18n_text_domain__ ),
			formDisclaimer: __(
				'Please do not provide financial or contact information when submitting this form.',
				__i18n_text_domain__
			),
			buttonLabel: __( 'Ask in the forums', __i18n_text_domain__ ),
			buttonSubmittingLabel: __( 'Posting in the forums', __i18n_text_domain__ ),
			buttonLoadingLabel: __( 'Analyzing site…', __i18n_text_domain__ ),
		},
	}[ mode ];
}

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

type Mode = 'CHAT' | 'EMAIL' | 'FORUM';

export const HelpCenterContactForm = () => {
	const { search } = useLocation();
	const sectionName = useSelector( getSectionName );
	const params = new URLSearchParams( search );
	const mode = params.get( 'mode' ) as Mode;
	const overflow = params.get( 'overflow' ) === 'true';
	const history = useHistory();
	const [ hideSiteInfo, setHideSiteInfo ] = useState( false );
	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );
	const locale = useLocale();
	const { isLoading: submittingTicket, mutateAsync: submitTicket } = useSubmitTicketMutation();
	const { isLoading: submittingTopic, mutateAsync: submitTopic } = useSubmitForumsMutation();
	const userId = useSelector( getCurrentUserId );
	const { data: userSites } = useUserSites( userId );
	const userWithNoSites = userSites?.sites.length === 0;
	const queryClient = useQueryClient();
	const email = useSelector( getCurrentUserEmail );
	const [ sitePickerChoice, setSitePickerChoice ] = useState< 'CURRENT_SITE' | 'OTHER_SITE' >(
		'CURRENT_SITE'
	);
	const { currentSite, subject, message, userDeclaredSiteUrl } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			currentSite: helpCenterSelect.getSite(),
			subject: helpCenterSelect.getSubject(),
			message: helpCenterSelect.getMessage(),
			userDeclaredSiteUrl: helpCenterSelect.getUserDeclaredSiteUrl(),
		};
	}, [] );

	const {
		setSite,
		resetStore,
		setUserDeclaredSiteUrl,
		setUserDeclaredSite,
		setSubject,
		setMessage,
	} = useDispatch( HELP_CENTER_STORE );

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

	const formTitles = useFormTitles( mode );

	let ownershipResult: AnalysisReport = useSiteAnalysis(
		// pass user email as query cache key
		userId,
		userDeclaredSiteUrl,
		sitePickerChoice === 'OTHER_SITE'
	);

	const ownershipStatusLoading = ownershipResult?.result === 'LOADING';
	const isSubmitting = submittingTicket || submittingTopic;

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
	function handleCTA() {
		if ( ! showingSibylResults && sibylArticles && sibylArticles.length > 0 ) {
			params.set( 'show-results', 'true' );
			history.push( {
				pathname: '/contact-form',
				search: params.toString(),
			} );
			return;
		}
		const productSlug = ( supportSite as HelpCenterSite )?.plan.product_slug;
		const plan = getPlan( productSlug );
		const productId = plan?.getProductId();
		const productName = plan?.getTitle();
		const productTerm = getPlanTermLabel( productSlug, ( text ) => text );

		switch ( mode ) {
			case 'CHAT':
				if ( supportSite ) {
					recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
						support_variation: 'happychat',
						force_site_id: true,
						location: 'help-center',
						section: sectionName,
					} );

					recordTracksEvent( 'calypso_help_live_chat_begin', {
						site_plan_product_id: productId,
						is_automated_transfer: supportSite?.is_wpcom_atomic,
						force_site_id: true,
						location: 'help-center',
						section: sectionName,
					} );
					history.push( '/inline-chat' );
					break;
				}
				break;

			case 'EMAIL':
				if ( supportSite ) {
					const ticketMeta = [
						'Site I need help with: ' + supportSite.URL,
						`Plan: ${ productId } - ${ productName } (${ productTerm })`,
					];

					if ( getQueryArgs()?.ref === 'woocommerce-com' ) {
						ticketMeta.push(
							`Created during store setup on ${
								isWcMobileApp() ? 'Woo mobile app' : 'Woo browser'
							}`
						);
					}

					const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

					submitTicket( {
						subject: subject ?? '',
						message: kayakoMessage,
						locale,
						client: 'browser:help-center',
						is_chat_overflow: overflow,
						source: 'source_wpcom_help_center',
						blog_url: supportSite.URL,
					} )
						.then( () => {
							recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
								support_variation: 'kayako',
								force_site_id: true,
								location: 'help-center',
								section: sectionName,
							} );
							history.push( '/success' );
							resetStore();
							// reset support-history cache
							setTimeout( () => {
								// wait 30 seconds until support-history endpoint actually updates
								// yup, it takes that long (tried 5, and 10)
								queryClient.invalidateQueries( [ `activeSupportTickets`, email ] );
							}, 30000 );
						} )
						.catch( () => {
							setHasSubmittingError( true );
						} );
				}
				break;

			case 'FORUM':
				submitTopic( {
					ownershipResult,
					message: message ?? '',
					subject: subject ?? '',
					locale,
					hideInfo: hideSiteInfo,
					userDeclaredSiteUrl,
				} )
					.then( ( response ) => {
						recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
							support_variation: 'forums',
							force_site_id: true,
							location: 'help-center',
							section: sectionName,
						} );
						history.push( `/success?forumTopic=${ encodeURIComponent( response.topic_URL ) }` );
						resetStore();
					} )
					.catch( () => {
						setHasSubmittingError( true );
					} );
				break;
		}
	}

	const InfoTip = () => {
		const ref = useRef< any >();
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

	const isCTADisabled = () => {
		if ( isSubmitting || ! message || ownershipStatusLoading ) {
			return true;
		}

		switch ( mode ) {
			case 'CHAT':
				return ! supportSite;
			case 'EMAIL':
				return ! supportSite || ! subject;
			case 'FORUM':
				return ! subject;
		}
	};

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

		if ( ownershipStatusLoading ) {
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
			{ formTitles.formSubtitle && (
				<p className="help-center-contact-form__site-picker-form-subtitle">
					{ formTitles.formSubtitle }
				</p>
			) }

			{ formTitles.formDisclaimer && (
				<p className="help-center-contact-form__site-picker-form-warning">
					{ formTitles.formDisclaimer }
				</p>
			) }

			{ ! userWithNoSites && (
				<section>
					<HelpCenterSitePicker
						enabled={
							mode === 'FORUM' &&
							( ( supportSite?.plan?.product_slug &&
								isFreePlanProduct( { product_slug: supportSite.plan?.product_slug } ) ) ||
								userWithNoSites )
						}
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
			) }

			{ sitePickerChoice === 'OTHER_SITE' && (
				<>
					<section>
						<TextControl
							label={ __( 'Site address', __i18n_text_domain__ ) }
							value={ userDeclaredSiteUrl ?? '' }
							onChange={ setUserDeclaredSiteUrl }
						/>
					</section>
					<HelpCenterOwnershipNotice ownershipResult={ ownershipResult } />
				</>
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
