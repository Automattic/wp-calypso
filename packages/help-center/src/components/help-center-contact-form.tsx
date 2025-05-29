/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan, getPlanTermLabel } from '@automattic/calypso-products';
import { FormInputValidation, Popover } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { getOdieIdFromInteraction } from '@automattic/odie-client/src/utils';
import { Button, TextControl, CheckboxControl, Tip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { getQueryArgs } from '@wordpress/url';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { preventWidows } from 'calypso/lib/formatting';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
/**
 * Internal Dependencies
 */
import { EMAIL_SUPPORT_LOCALES } from '../constants';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useJetpackSearchAIQuery } from '../data/use-jetpack-search-ai';
import { useSiteAnalysis } from '../data/use-site-analysis';
import { useSubmitForumsMutation } from '../data/use-submit-forums-topic';
import { useSubmitTicketMutation } from '../data/use-submit-support-ticket';
import { useUserSites } from '../data/use-user-sites';
import { useContactFormTitle } from '../hooks';
import { queryClient } from '../query-client';
import { HELP_CENTER_STORE } from '../stores';
import { getSupportVariationFromMode } from '../support-variations';
import { SearchResult } from '../types';
import { HelpCenterGPT } from './help-center-gpt';
import HelpCenterSearchResults from './help-center-search-results';
import { HelpCenterSitePicker } from './help-center-site-picker';
import type { JetpackSearchAIResult } from '../data/use-jetpack-search-ai';
import type { AnalysisReport } from '../types';
import type { HelpCenterSelect, SiteDetails, HelpCenterSite } from '@automattic/data-stores';
import './help-center-contact-form.scss';

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

const isLocaleNotSupportedInEmailSupport = ( locale: string ) => {
	return ! EMAIL_SUPPORT_LOCALES.includes( locale );
};

type Mode = 'EMAIL' | 'FORUM';

export const HelpCenterContactForm = () => {
	const { search } = useLocation();
	const { sectionName, currentUser, site } = useHelpCenterContext();
	const params = new URLSearchParams( search );
	const mode = params.get( 'mode' ) as Mode;
	const overflow = params.get( 'overflow' ) === 'true';
	const wapuuFlow = params.get( 'wapuuFlow' ) === 'true';
	const navigate = useNavigate();
	const [ hideSiteInfo, setHideSiteInfo ] = useState( false );
	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );
	const locale = useLocale();
	const { isPending: submittingTicket, mutateAsync: submitTicket } = useSubmitTicketMutation();
	const { isPending: submittingTopic, mutateAsync: submitTopic } = useSubmitForumsMutation();
	const { data: userSites } = useUserSites( currentUser.ID );
	const userWithNoSites = userSites?.sites.length === 0;
	const [ isSelfDeclaredSite, setIsSelfDeclaredSite ] = useState< boolean >( false );
	const [ gptResponse, setGptResponse ] = useState< JetpackSearchAIResult >();
	const { currentSupportInteraction, subject, message, userDeclaredSiteUrl } = useSelect(
		( select ) => {
			const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
			return {
				currentSupportInteraction: helpCenterSelect.getCurrentSupportInteraction(),
				subject: helpCenterSelect.getSubject(),
				message: helpCenterSelect.getMessage(),
				userDeclaredSiteUrl: helpCenterSelect.getUserDeclaredSiteUrl(),
			};
		},
		[]
	);

	const odieId = getOdieIdFromInteraction( currentSupportInteraction );

	const { resetStore, setUserDeclaredSite, setSubject, setMessage } =
		useDispatch( HELP_CENTER_STORE );

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
			setIsSelfDeclaredSite( true );
		}
	}, [ userWithNoSites ] );

	const formTitles = useContactFormTitle( mode );

	let ownershipResult: AnalysisReport = useSiteAnalysis(
		// pass user email as query cache key
		currentUser.ID,
		userDeclaredSiteUrl,
		isSelfDeclaredSite
	);

	const ownershipStatusLoading = ownershipResult?.result === 'LOADING';
	const isSubmitting = submittingTicket || submittingTopic;

	// if the user picked a site from the picker, we don't need to analyze the ownership
	if ( site && ! isSelfDeclaredSite ) {
		ownershipResult = {
			result: 'OWNED_BY_USER',
			isWpcom: true,
			siteURL: site.URL,
			site: site,
		};
	}

	// record the resolved site
	useEffect( () => {
		if ( ownershipResult?.site && isSelfDeclaredSite ) {
			setUserDeclaredSite( ownershipResult?.site as SiteDetails );
		}
	}, [ ownershipResult, setUserDeclaredSite, isSelfDeclaredSite ] );

	let supportSite: SiteDetails | HelpCenterSite;

	// if the user picked "other site", force them to declare a site
	if ( isSelfDeclaredSite ) {
		supportSite = ownershipResult?.site as SiteDetails;
	} else {
		supportSite = site as HelpCenterSite;
	}

	const [ debouncedMessage ] = useDebounce( message || '', 500 );
	const [ debouncedSubject ] = useDebounce( subject || '', 500 );

	const enableGPTResponse =
		config.isEnabled( 'help/gpt-response' ) &&
		! ( params.get( 'disable-gpt' ) === 'true' ) &&
		! wapuuFlow;

	const showingSearchResults = params.get( 'show-results' ) === 'true';
	const skipResources = params.get( 'skip-resources' ) === 'true';
	const showingGPTResponse = enableGPTResponse && params.get( 'show-gpt' ) === 'true';

	const redirectToArticle = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement, MouseEvent >, result: SearchResult ) => {
			event.preventDefault();

			// if result.post_id isn't set then open in a new window
			if ( ! result.post_id ) {
				const tracksData = {
					search_query: debouncedMessage,
					force_site_id: true,
					location: 'help-center',
					result_url: result.link,
					post_id: result.post_id,
					blog_id: result.blog_id,
				};
				recordTracksEvent( 'calypso_inlinehelp_article_no_postid_redirect', tracksData );
				window.open( result.link, '_blank' );
				return;
			}

			const params = new URLSearchParams( {
				link: result.link,
				postId: String( result.post_id ),
				query: debouncedMessage || '',
				title: preventWidows( decodeEntities( result.title ) ),
			} );

			if ( result.blog_id ) {
				params.set( 'blogId', String( result.blog_id ) );
			}

			navigate( `/post/?${ params }` );
		},
		[ debouncedMessage, navigate ]
	);

	// this indicates the user was happy with the GPT response
	function handleGPTClose() {
		// send a tracks event
		recordTracksEvent( 'calypso_inlinehelp_contact_gpt_close', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		resetStore();

		navigate( '/' );
	}

	function navigateToContactForm() {
		navigate( {
			pathname: '/contact-form',
			search: params.toString(),
		} );
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
		navigateToContactForm();
	}

	function handleCTA() {
		if (
			! enableGPTResponse &&
			! showingSearchResults &&
			! wapuuFlow &&
			! skipResources &&
			mode !== 'FORUM'
		) {
			params.set( 'show-results', 'true' );
			navigateToContactForm();
			return;
		}

		if ( ! showingGPTResponse && enableGPTResponse && ! wapuuFlow && mode !== 'FORUM' ) {
			params.set( 'show-gpt', 'true' );
			navigateToContactForm();
			return;
		}

		// if the user was chatting with Wapuu, we need to disable GPT (no more AI)
		if ( wapuuFlow ) {
			params.set( 'disable-gpt', 'true' );
			params.set( 'show-gpt', 'false' );
		}

		// Domain only sites don't have plans.
		const productSlug = ( supportSite as HelpCenterSite )?.plan?.product_slug;
		const plan = getPlan( productSlug );
		const productId = plan?.getProductId();
		const productName = plan?.getTitle();
		const productTerm = getPlanTermLabel( productSlug, ( text ) => text );

		const aiChatId = wapuuFlow ? odieId?.toString() ?? '' : gptResponse?.answer_id;

		switch ( mode ) {
			case 'EMAIL':
				if ( supportSite ) {
					const ticketMeta = [
						'Site I need help with: ' + supportSite.URL,
						`Plan: ${ productId } - ${ productName } (${ productTerm })`,
					];

					if ( getQueryArgs( window.location.href )?.ref === 'woocommerce-com' ) {
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
						ai_chat_id: aiChatId,
						ai_message: gptResponse?.response,
					} )
						.then( () => {
							recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
								support_variation: 'email',
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
								queryClient.invalidateQueries( {
									queryKey: [ 'help-support-history', 'ticket', currentUser.ID ],
								} );
							}, 30000 );
						} )
						.catch( () => {
							setHasSubmittingError( true );
						} );
				}
				break;

			case 'FORUM':
				params.set( 'show-results', 'true' );
				navigateToContactForm();
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
					className="help-center"
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

	const shouldShowHelpLanguagePrompt = isLocaleNotSupportedInEmailSupport( locale );

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

	const { isFetching: isFetchingGPTResponse, isError: isGPTError } = useJetpackSearchAIQuery( {
		siteId: '9619154',
		query: jpSearchAiQueryText,
		stopAt: 'response',
		enabled: enableGPTResponse && showingGPTResponse,
	} );

	const isCTADisabled = () => {
		if ( isSubmitting || ! message || ownershipStatusLoading ) {
			return true;
		}

		// We're prefetching the GPT response,
		// so only disabling the button while fetching if we're on the response screen
		if ( showingGPTResponse && isFetchingGPTResponse ) {
			return true;
		}

		switch ( mode ) {
			case 'EMAIL':
				return ! supportSite || ! subject;
			case 'FORUM':
				return ! subject;
		}
	};

	const getCTALabel = () => {
		const showingHelpOrGPTResults = showingSearchResults || showingGPTResponse;

		if ( mode === 'FORUM' && showingSearchResults ) {
			return formTitles.buttonSubmittingLabel;
		}

		if ( ! showingGPTResponse && ! showingSearchResults && ! skipResources ) {
			return __( 'Continue', __i18n_text_domain__ );
		}

		if ( showingGPTResponse && isFetchingGPTResponse ) {
			return __( 'Gathering quick response.', __i18n_text_domain__ );
		}

		if ( mode === 'EMAIL' && showingHelpOrGPTResults ) {
			return __( 'Still email us', __i18n_text_domain__ );
		}

		if ( ownershipStatusLoading ) {
			return formTitles.buttonLoadingLabel;
		}

		return isSubmitting ? formTitles.buttonSubmittingLabel : formTitles.buttonLabel;
	};

	if ( enableGPTResponse && showingGPTResponse ) {
		return (
			<>
				<div className="help-center-contact-form__wrapper">
					<div className="help-center__articles-page">
						<HelpCenterGPT
							redirectToArticle={ redirectToArticle }
							onResponseReceived={ setGptResponse }
						/>
						<section className="contact-form-submit">
							<Button
								isBusy={ isFetchingGPTResponse }
								disabled={ isCTADisabled() }
								onClick={ handleCTA }
								variant={ showingGPTResponse && ! isGPTError ? 'secondary' : 'primary' }
								className="help-center-contact-form__site-picker-cta"
							>
								{ getCTALabel() }
							</Button>
							{ ! isFetchingGPTResponse && showingGPTResponse && ! hasSubmittingError && (
								<Button variant={ isGPTError ? 'secondary' : 'primary' } onClick={ handleGPTClose }>
									{ __( 'Close', __i18n_text_domain__ ) }
								</Button>
							) }
							{ isFetchingGPTResponse && ! isGPTError && (
								<Button variant="secondary" onClick={ handleGPTCancel }>
									{ __( 'Cancel', __i18n_text_domain__ ) }
								</Button>
							) }
							{ hasSubmittingError && (
								<FormInputValidation
									isError
									text={ __(
										'Something went wrong, please try again later.',
										__i18n_text_domain__
									) }
								/>
							) }
						</section>
						{ ! isFetchingGPTResponse &&
							showingGPTResponse &&
							mode === 'EMAIL' &&
							getHEsTraySection() }
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="help-center-contact-form__wrapper">
				{ showingSearchResults ? (
					<div className="help-center__articles-page">
						<HelpCenterSearchResults
							onSelect={ redirectToArticle }
							searchQuery={ message || '' }
							openAdminInNewTab
							placeholderLines={ 4 }
							location="help-center-contact-form"
						/>
						<section className="contact-form-submit">
							<Button
								isBusy={ isSubmitting }
								disabled={ isCTADisabled() }
								onClick={ handleCTA }
								variant="primary"
								className="help-center-contact-form__site-picker-cta"
							>
								{ getCTALabel() }
							</Button>
							{ hasSubmittingError && (
								<FormInputValidation
									isError
									text={ __(
										'Something went wrong, please try again later.',
										__i18n_text_domain__
									) }
								/>
							) }
						</section>
						{ mode === 'EMAIL' && getHEsTraySection() }
					</div>
				) : (
					<div className="help-center-contact-form">
						<main>
							<h1 className="help-center-contact-form__site-picker-title">
								{ formTitles.formTitle }
							</h1>

							{ formTitles.formDisclaimer && (
								<p className="help-center-contact-form__site-picker-form-warning">
									{ formTitles.formDisclaimer }
								</p>
							) }

							<HelpCenterSitePicker
								ownershipResult={ ownershipResult }
								isSelfDeclaredSite={ isSelfDeclaredSite }
								onSelfDeclaredSite={ setIsSelfDeclaredSite }
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
						</main>
						<div className="contact-form-submit">
							<Button
								isBusy={ isSubmitting }
								disabled={ isCTADisabled() }
								onClick={ handleCTA }
								variant="primary"
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
									text={ __(
										'Something went wrong, please try again later.',
										__i18n_text_domain__
									) }
								/>
							) }
						</div>
						{ mode === 'EMAIL' && getHEsTraySection() }
						{ ! [ 'FORUM' ].includes( mode ) && (
							<HelpCenterSearchResults
								onSelect={ redirectToArticle }
								searchQuery={ message || '' }
								openAdminInNewTab
								placeholderLines={ 4 }
								location="help-center-contact-form"
							/>
						) }
					</div>
				) }
			</div>
		</>
	);
};
