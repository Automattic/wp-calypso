/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan, getPlanTermLabel, isFreePlanProduct } from '@automattic/calypso-products';
import { FormInputValidation, Popover, Spinner } from '@automattic/components';
import {
	useSubmitTicketMutation,
	useSubmitForumsMutation,
	useSiteAnalysis,
	useUserSites,
	AnalysisReport,
	SiteDetails,
	HelpCenterSite,
	useJetpackSearchAIQuery,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import { Button, TextControl, CheckboxControl, Tip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { getQueryArgs } from 'calypso/lib/query-args';
import { getCurrentUserEmail, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { useChatStatus, useContactFormTitle, useChatWidget, useZendeskMessaging } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { getSupportVariationFromMode } from '../support-variations';
import { BackButton } from './back-button';
import { HelpCenterGPT } from './help-center-gpt';
import HelpCenterSearchResults from './help-center-search-results';
import { HelpCenterSitePicker } from './help-center-site-picker';
import ThirdPartyCookiesNotice from './help-center-third-party-cookies-notice';
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
	const navigate = useNavigate();
	const [ hideSiteInfo, setHideSiteInfo ] = useState( false );
	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );
	const locale = useLocale();
	const { isLoading: submittingTicket, mutateAsync: submitTicket } = useSubmitTicketMutation();
	const { isLoading: submittingTopic, mutateAsync: submitTopic } = useSubmitForumsMutation();
	const { isOpeningChatWidget, openChatWidget } = useChatWidget();
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

	const { setSite, resetStore, setUserDeclaredSite, setShowMessagingChat, setSubject, setMessage } =
		useDispatch( HELP_CENTER_STORE );

	const {
		canConnectToZendesk,
		hasActiveChats,
		isEligibleForChat,
		isLoading: isLoadingChatStatus,
	} = useChatStatus();
	useZendeskMessaging(
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats,
		isEligibleForChat || hasActiveChats
	);

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

	const formTitles = useContactFormTitle( mode );

	let ownershipResult: AnalysisReport = useSiteAnalysis(
		// pass user email as query cache key
		userId,
		userDeclaredSiteUrl,
		sitePickerChoice === 'OTHER_SITE'
	);

	const ownershipStatusLoading = ownershipResult?.result === 'LOADING';
	const isSubmitting = submittingTicket || submittingTopic || isOpeningChatWidget;

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

	const [ debouncedMessage ] = useDebounce( message || '', 1000 );
	const [ debouncedSubject ] = useDebounce( subject || '', 1000 );

	const enableGPTResponse =
		config.isEnabled( 'help/gpt-response' ) && ! ( params.get( 'disable-gpt' ) === 'true' );

	const showingSearchResults = params.get( 'show-results' ) === 'true';
	const showingGPTResponse = enableGPTResponse && params.get( 'show-gpt' ) === 'true';

	const redirectToArticle = useCallback(
		( event, result ) => {
			event.preventDefault();

			// if result.post_id isn't set then open in a new window
			if ( ! result.post_id ) {
				const tracksData = {
					search_query: debouncedMessage,
					force_site_id: true,
					location: 'help-center',
					result_url: result.link,
					post_id: result.postId,
					blog_id: result.blogId,
				};
				recordTracksEvent( `calypso_inlinehelp_article_no_postid_redirect`, tracksData );
				window.open( result.link, '_blank' );
				return;
			}

			const searchResult = {
				...result,
				title: preventWidows( decodeEntities( result.title ) ),
				query: debouncedMessage,
			};
			const params = new URLSearchParams( {
				link: result.link,
				postId: result.post_id,
				query: debouncedMessage || '',
				title: preventWidows( decodeEntities( result.title ) ),
			} );

			if ( result.blog_id ) {
				params.set( 'blogId', result.blog_id );
			}

			navigate( `/post/?${ params }`, searchResult );
		},
		[ navigate, debouncedMessage ]
	);

	// this indicates the user was happy with the GPT response
	function handleGPTClose() {
		// send a tracks event
		recordTracksEvent( 'calypso_inlinehelp_contact_gpt_close', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		const savedCurrentSite = currentSite;
		resetStore();
		setSite( savedCurrentSite );

		navigate( '/' );
	}

	function handleGPTCancel() {
		// send a tracks event
		recordTracksEvent( 'calypso_inlinehelp_contact_gpt_cancel', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		// stop loading the GPT response
		params.set( 'show-gpt', 'false' );
		params.set( 'disable-gpt', 'true' );
		navigate( {
			pathname: '/contact-form',
			search: params.toString(),
		} );
	}

	function handleCTA() {
		if ( ! enableGPTResponse && ! showingSearchResults ) {
			params.set( 'show-results', 'true' );
			navigate( {
				pathname: '/contact-form',
				search: params.toString(),
			} );
			return;
		}

		if ( ! showingGPTResponse && enableGPTResponse ) {
			params.set( 'show-gpt', 'true' );
			navigate( {
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
						support_variation: 'messaging',
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

					openChatWidget( supportSite, message, () => setHasSubmittingError( true ) );
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
							navigate( '/success' );
							resetStore();
							// reset support-history cache
							setTimeout( () => {
								// wait 30 seconds until support-history endpoint actually updates
								// yup, it takes that long (tried 5, and 10)
								queryClient.invalidateQueries( [ 'help-support-history', 'ticket', email ] );
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
						navigate( `/success?forumTopic=${ encodeURIComponent( response.topic_URL ) }` );
						resetStore();
					} )
					.catch( () => {
						setHasSubmittingError( true );
					} );
				break;
		}
	}

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

	const getHEsTraySection = () => {
		return (
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
		);
	};

	let jpSearchAiQueryText = debouncedMessage;
	// For the JP search, we want to join the subject and message together if they're not the same
	if (
		debouncedSubject &&
		debouncedMessage &&
		debouncedSubject.slice( 0, 50 ) !== debouncedMessage.slice( 0, 50 )
	) {
		jpSearchAiQueryText = `${ debouncedSubject }\n\n${ debouncedMessage }`;
	}

	const {
		isFetching: isFetchingGPTResponse,
		isError: isGPTError,
		data: gptResponse,
	} = useJetpackSearchAIQuery( {
		siteId: '9619154',
		query: jpSearchAiQueryText,
		stopAt: 'response',
		enabled: enableGPTResponse,
	} );

	const getCTALabel = () => {
		const showingHelpOrGPTResults = showingSearchResults || showingGPTResponse;

		if ( ! showingGPTResponse && ! showingSearchResults ) {
			return __( 'Continue', __i18n_text_domain__ );
		}

		if ( showingGPTResponse && isFetchingGPTResponse ) {
			return __( 'Gathering quick response.', __i18n_text_domain__ );
		}

		if ( mode === 'CHAT' && showingHelpOrGPTResults ) {
			return __( 'Still chat with us', __i18n_text_domain__ );
		}

		if ( mode === 'EMAIL' && showingHelpOrGPTResults ) {
			return __( 'Still email us', __i18n_text_domain__ );
		}

		if ( ownershipStatusLoading ) {
			return formTitles.buttonLoadingLabel;
		}

		return isSubmitting ? formTitles.buttonSubmittingLabel : formTitles.buttonLabel;
	};

	if ( hasActiveChats ) {
		setShowMessagingChat( true );
	}

	if ( isLoadingChatStatus ) {
		return (
			<div className="help-center-contact-form__loading">
				<Spinner baseClassName="" />
			</div>
		);
	}

	if ( mode === 'CHAT' && ! canConnectToZendesk ) {
		return <ThirdPartyCookiesNotice />;
	}

	if ( enableGPTResponse && showingGPTResponse ) {
		return (
			<div className="help-center__articles-page">
				<BackButton />
				<HelpCenterGPT />
				<section className="contact-form-submit">
					<Button
						isBusy={ isFetchingGPTResponse }
						disabled={ isFetchingGPTResponse }
						onClick={ handleCTA }
						isPrimary={ ! showingGPTResponse || isGPTError }
						isSecondary={ showingGPTResponse && ! isGPTError }
						className="help-center-contact-form__site-picker-cta"
					>
						{ getCTALabel() }
					</Button>
					{ ! isFetchingGPTResponse && showingGPTResponse && ! hasSubmittingError && (
						<Button
							isPrimary={ ! isGPTError }
							isSecondary={ isGPTError }
							onClick={ handleGPTClose }
						>
							{ __( 'Close', __i18n_text_domain__ ) }
						</Button>
					) }
					{ isFetchingGPTResponse && ! isGPTError && (
						<Button isSecondary onClick={ handleGPTCancel }>
							{ __( 'Cancel', __i18n_text_domain__ ) }
						</Button>
					) }
					{ hasSubmittingError && (
						<FormInputValidation
							isError
							text={ __( 'Something went wrong, please try again later.', __i18n_text_domain__ ) }
						/>
					) }
				</section>
				{ gptResponse?.response && [ 'CHAT', 'EMAIL' ].includes( mode ) && getHEsTraySection() }
			</div>
		);
	}

	return showingSearchResults ? (
		<div className="help-center__articles-page">
			<BackButton />
			<HelpCenterSearchResults
				onSelect={ redirectToArticle }
				searchQuery={ message || '' }
				openAdminInNewTab
				placeholderLines={ 4 }
				location="help-center-contact-form"
			/>
			<section className="contact-form-submit">
				<Button
					disabled={ isCTADisabled() }
					onClick={ handleCTA }
					isPrimary
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
			{ [ 'CHAT', 'EMAIL' ].includes( mode ) && getHEsTraySection() }
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

			<HelpCenterSitePicker
				ownershipResult={ ownershipResult }
				sitePickerChoice={ sitePickerChoice }
				setSitePickerChoice={ setSitePickerChoice }
				currentSite={ currentSite }
				siteId={ sitePickerChoice === 'CURRENT_SITE' ? currentSite?.ID : 0 }
				sitePickerEnabled={
					mode === 'FORUM' &&
					Boolean( supportSite?.plan?.product_slug ) &&
					isFreePlanProduct( { product_slug: supportSite.plan?.product_slug as string } )
				}
			/>

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
					isPrimary
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
			{ [ 'CHAT', 'EMAIL' ].includes( mode ) && getHEsTraySection() }
			<HelpCenterSearchResults
				onSelect={ redirectToArticle }
				searchQuery={ message || '' }
				openAdminInNewTab
				placeholderLines={ 4 }
				location="help-center-contact-form"
			/>
		</main>
	);
};
