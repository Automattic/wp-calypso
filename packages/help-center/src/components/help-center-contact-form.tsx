/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, FormInputValidation, Popover } from '@automattic/components';
import {
	useSubmitTicketMutation,
	useSubmitForumsMutation,
	useSiteAnalysis,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { SitePickerDropDown } from '@automattic/site-picker';
import { TextControl, CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { getSectionName, getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { askDirectlyQuestion, execute } from '../directly';
import { HELP_CENTER_STORE, USER_STORE } from '../stores';
import { getSupportVariationFromMode } from '../support-variations';
import { SitePicker } from '../types';
import { BackButton } from './back-button';
import { HelpCenterOwnershipNotice } from './help-center-notice';
import { SibylArticles } from './help-center-sibyl-articles';
import './help-center-contact-form.scss';

export const SITE_STORE = 'automattic/site';

const fakeFaces = Array.from(
	{ length: 10 },
	( _, index ) => `https://s0.wp.com/i/fake-faces/face-${ index }.jpg`
);
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
		logo: { id: '', sizes: [], url: '' },
		URL: '',
	};

	function pickSite( ID: number ) {
		onSelect( ID );
	}

	const options = [ currentSite, otherSite ];

	return (
		<SitePickerDropDown
			enabled={ enabled }
			onPickSite={ pickSite }
			options={ options }
			siteId={ siteId }
		/>
	);
};

const titles: {
	[ key: string ]: {
		formTitle: string;
		formSubtitle?: string;
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
	DIRECTLY: {
		formTitle: __( 'Start live chat with an expert', __i18n_text_domain__ ),
		formSubtitle: __(
			'These are others, like yourself, who have been selected because of their WordPress.com knowledge to help answer questions.',
			__i18n_text_domain__
		),
		trayText: __( 'An expert user will be with you right away', __i18n_text_domain__ ),
		formDisclaimer: __(
			'Please do not provide financial or contact information when submitting this form.',
			__i18n_text_domain__
		),
		buttonLabel: __( 'Ask an expert', __i18n_text_domain__ ),
		buttonLoadingLabel: __( 'Connecting you to an expert', __i18n_text_domain__ ),
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

type Mode = 'CHAT' | 'EMAIL' | 'DIRECTLY' | 'FORUM';

export const HelpCenterContactForm = () => {
	const { search } = useLocation();
	const sectionName = useSelector( getSectionName );
	const params = new URLSearchParams( search );
	const mode = params.get( 'mode' ) as Mode;
	const history = useHistory();
	const [ hideSiteInfo, setHideSiteInfo ] = useState( false );
	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );
	const locale = useLocale();
	const { isLoading: submittingTicket, mutateAsync: submitTicket } = useSubmitTicketMutation();
	const { isLoading: submittingTopic, mutateAsync: submitTopic } = useSubmitForumsMutation();
	const [ sitePickerChoice, setSitePickerChoice ] = useState< 'CURRENT_SITE' | 'OTHER_SITE' >(
		'CURRENT_SITE'
	);
	const { selectedSite, subject, message, userDeclaredSiteUrl, directlyData } = useSelect(
		( select ) => {
			return {
				selectedSite: select( HELP_CENTER_STORE ).getSite(),
				subject: select( HELP_CENTER_STORE ).getSubject(),
				message: select( HELP_CENTER_STORE ).getMessage(),
				userDeclaredSiteUrl: select( HELP_CENTER_STORE ).getUserDeclaredSiteUrl(),
				directlyData: select( HELP_CENTER_STORE ).getDirectly(),
			};
		}
	);
	const userData = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const {
		setSite,
		resetStore,
		setShowHelpCenter,
		setUserDeclaredSiteUrl,
		setUserDeclaredSite,
		setSubject,
		setMessage,
	} = useDispatch( HELP_CENTER_STORE );

	const {
		result: ownershipResult,
		isLoading: isAnalysisLoading,
		site: userDeclaredSite,
	} = useSiteAnalysis( userDeclaredSiteUrl );

	useEffect( () => {
		const supportVariation = getSupportVariationFromMode( mode );
		recordTracksEvent( 'calypso_inlinehelp_contact_view', {
			support_variation: supportVariation,
			location: 'help-center',
			section: sectionName,
		} );
	}, [ mode, sectionName ] );

	// record the resolved site
	useEffect( () => {
		if ( userDeclaredSite ) {
			setUserDeclaredSite( userDeclaredSite );
		}
	}, [ userDeclaredSite, setUserDeclaredSite ] );

	useEffect( () => {
		if ( directlyData?.hasSession ) {
			execute( [ 'maximize', {} ] );
			setShowHelpCenter( false );
		}
	}, [ directlyData, setShowHelpCenter ] );

	const isSubmitting = submittingTicket || submittingTopic;

	const formTitles = titles[ mode ];

	const siteId = useSelector( getSelectedSiteId );
	const currentSite = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ) );

	let supportSite: typeof currentSite;

	// if the user picked "other site", force them to declare a site
	if ( sitePickerChoice === 'OTHER_SITE' ) {
		supportSite = userDeclaredSite;
	} else {
		supportSite = selectedSite || currentSite;
	}

	function handleCTA() {
		switch ( mode ) {
			case 'CHAT': {
				if ( supportSite ) {
					recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
						support_variation: 'happychat',
						location: 'help-center',
						section: sectionName,
					} );

					recordTracksEvent( 'calypso_help_live_chat_begin', {
						site_plan_product_id: supportSite ? supportSite.plan?.product_id : null,
						is_automated_transfer: supportSite ? supportSite.options.is_automated_transfer : null,
						location: 'help-center',
						section: sectionName,
					} );
					history.push( '/inline-chat' );
					break;
				}
				break;
			}

			case 'EMAIL': {
				if ( supportSite ) {
					const ticketMeta = [
						'Site I need help with: ' + supportSite.URL,
						'Plan: ' + supportSite.plan?.product_slug,
					];

					const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

					submitTicket( {
						subject: subject ?? '',
						message: kayakoMessage,
						locale,
						client: 'browser:help-center',
						is_chat_overflow: false,
						blog_url: supportSite.URL,
					} )
						.then( () => {
							recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
								support_variation: 'kayako',
								location: 'help-center',
								section: sectionName,
							} );
							history.push( '/success' );
							resetStore();
						} )
						.catch( () => {
							setHasSubmittingError( true );
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
				} )
					.then( ( response ) => {
						recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
							support_variation: 'forums',
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
			case 'DIRECTLY': {
				askDirectlyQuestion( message ?? '', userData?.display_name ?? '', userData?.email ?? '' );
				recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
					support_variation: 'directly',
					location: 'help-center',
					section: sectionName,
				} );
				setShowHelpCenter( false );
				break;
			}
		}
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
		if ( isSubmitting || ! message ) {
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

	return (
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
			{ mode !== 'DIRECTLY' && (
				<section>
					<HelpCenterSitePicker
						enabled={ mode === 'FORUM' }
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

			<section>
				<Button
					disabled={ isCTADisabled() }
					onClick={ handleCTA }
					primary
					className="help-center-contact-form__site-picker-cta"
				>
					{ isSubmitting ? formTitles.buttonLoadingLabel : formTitles.buttonLabel }
				</Button>
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
