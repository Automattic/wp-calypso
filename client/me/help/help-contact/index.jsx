import config from '@automattic/calypso-config';
import { getPlanTermLabel } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import QuerySupportHistory from 'calypso/components/data/query-support-history';
import QueryTicketSupportConfiguration from 'calypso/components/data/query-ticket-support-configuration';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isDefaultLocale, localizeUrl } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';
import ActiveTicketsNotice from 'calypso/me/help/active-tickets-notice';
import ChatHolidayClosureNotice from 'calypso/me/help/contact-form-notice/chat-holiday-closure';
import HelpContactConfirmation from 'calypso/me/help/help-contact-confirmation';
import HelpContactForm from 'calypso/me/help/help-contact-form';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import {
	getCurrentUser,
	getCurrentUserLocale,
	getCurrentUserSiteCount,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import {
	sendMessage as sendHappychatMessage,
	sendUserInfo,
} from 'calypso/state/happychat/connection/actions';
import getHappychatUserInfo from 'calypso/state/happychat/selectors/get-happychat-userinfo';
import hasHappychatLocalizedSupport from 'calypso/state/happychat/selectors/has-happychat-localized-support';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import { openChat as openHappychat } from 'calypso/state/happychat/ui/actions';
import {
	askQuestion as askDirectlyQuestion,
	initialize as initializeDirectly,
} from 'calypso/state/help/directly/actions';
import { getHelpSelectedSite } from 'calypso/state/help/selectors';
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'calypso/state/help/ticket/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import getActiveSupportTickets from 'calypso/state/selectors/get-active-support-tickets';
import getInlineHelpSupportVariation, {
	SUPPORT_CHAT_OVERFLOW,
	SUPPORT_DIRECTLY,
	SUPPORT_FORUM,
	SUPPORT_HAPPYCHAT,
	SUPPORT_TICKET,
	SUPPORT_UPWORK_TICKET,
} from 'calypso/state/selectors/get-inline-help-support-variation';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import hasUserAskedADirectlyQuestion from 'calypso/state/selectors/has-user-asked-a-directly-question';
import isDirectlyFailed from 'calypso/state/selectors/is-directly-failed';
import isDirectlyReady from 'calypso/state/selectors/is-directly-ready';
import isDirectlyUninitialized from 'calypso/state/selectors/is-directly-uninitialized';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import HelpUnverifiedWarning from '../help-unverified-warning';

import './style.scss';

const debug = debugFactory( 'calypso:help-contact' );

/**
 * Module variables
 */
const defaultLanguageSlug = config( 'i18n_default_locale_slug' );
let savedContactForm = null;

class HelpContact extends Component {
	static propTypes = {
		compact: PropTypes.bool,
	};

	static defaultProps = {
		compact: false,
	};

	state = {
		confirmation: null,
		isSubmitting: false,
		wasAdditionalSupportOptionShown: false,
	};

	componentDidMount() {
		this.prepareDirectlyWidget();
	}

	componentDidUpdate() {
		// Directly initialization is a noop if it's already happened. This catches
		// instances where a state/prop change moves a user to Directly support from
		// some other variation.
		this.prepareDirectlyWidget();
	}

	backToHelp = () => {
		page( '/help' );
	};

	clearSavedContactForm = () => {
		savedContactForm = null;
	};

	startHappychat = ( contactForm ) => {
		this.recordCompactSubmit( 'happychat' );
		this.props.openHappychat();
		const { howCanWeHelp, howYouFeel, message, site } = contactForm;

		this.props.sendUserInfo( this.props.getUserInfo( { howCanWeHelp, howYouFeel, site } ) );
		this.props.sendHappychatMessage( message, { includeInSummary: true } );

		recordTracksEvent( 'calypso_help_live_chat_begin', {
			site_plan_product_id: site ? site.plan.product_id : null,
			is_automated_transfer: site ? site.options.is_automated_transfer : null,
		} );

		if ( this.props.activeSupportTickets.length > 0 ) {
			recordTracksEvent( 'calypso_help_contact_submit_with_active_tickets', {
				support_type: 'chat',
				active_ticket_count: this.props.activeSupportTickets.length,
			} );
		}

		this.setState( {
			isSubmitting: false,
			confirmation: {
				title: this.props.translate( "We're on it!" ),
				message: this.props.translate(
					"We've received your message, and you'll hear back from " +
						'one of our Happiness Engineers shortly.'
				),
			},
		} );
		this.clearSavedContactForm();

		if ( ! this.props.compact ) {
			page( '/help' );
		}
	};

	prepareDirectlyWidget = () => {
		if ( this.props.isDirectlyUninitialized ) {
			this.props.initializeDirectly();
		}
	};

	submitDirectlyQuestion = ( contactForm ) => {
		this.recordCompactSubmit( 'directly' );
		const { display_name, email } = this.props.currentUser;

		this.props.askDirectlyQuestion( contactForm.message, display_name, email );

		this.clearSavedContactForm();

		if ( ! this.props.compact ) {
			page( '/help' );
		}

		if ( this.props.activeSupportTickets.length > 0 ) {
			recordTracksEvent( 'calypso_help_contact_submit_with_active_tickets', {
				support_type: 'directly',
				active_ticket_count: this.props.activeSupportTickets.length,
			} );
		}
	};

	submitKayakoTicket = ( contactForm ) => {
		const { subject, message, howCanWeHelp, howYouFeel, site } = contactForm;
		const { currentUserLocale, supportVariation } = this.props;
		let plan = 'N/A';
		if ( site ) {
			plan = `${ site.plan.product_id } - ${ site.plan.product_name_short } (${ getPlanTermLabel(
				site.plan.product_slug,
				( val ) => val // Passing an identity function instead of `translate` to always return the English string
			) })`;
		}
		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' ),
			'Plan: ' + plan,
		];

		const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );
		this.recordCompactSubmit( 'kayako' );

		wpcom.req
			.post( '/help/tickets/kayako/new', {
				subject,
				message: kayakoMessage,
				locale: currentUserLocale,
				client: config( 'client_slug' ),
				is_chat_overflow: supportVariation === SUPPORT_CHAT_OVERFLOW,
			} )
			.then( () => {
				this.setState( {
					isSubmitting: false,
					confirmation: {
						title: this.props.translate( "We're on it!" ),
						message: this.props.translate(
							"We've received your message, and you'll hear back from " +
								'one of our Happiness Engineers shortly.'
						),
					},
				} );

				recordTracksEvent( 'calypso_help_contact_submit', {
					ticket_type: 'kayako',
					support_variation: supportVariation,
					site_plan_product_id: site ? site.plan.product_id : null,
					is_automated_transfer: site ? site.options.is_automated_transfer : null,
				} );

				if ( this.props.activeSupportTickets.length > 0 ) {
					recordTracksEvent( 'calypso_help_contact_submit_with_active_tickets', {
						support_type: 'email',
						active_ticket_count: this.props.activeSupportTickets.length,
					} );
				}
			} )
			.catch( ( error ) => {
				// TODO: bump a stat here
				this.props.errorNotice( error.message );

				this.setState( { isSubmitting: false } );
			} );

		this.clearSavedContactForm();
	};

	translateForForums = ( message, args ) => {
		const { currentUserLocale, translate } = this.props;

		if ( config( 'forum_locales' ).includes( currentUserLocale ) ) {
			// eslint-disable-next-line wpcalypso/i18n-no-variables
			return translate( message, args );
		}

		return args ? message.replace( '%s', args.args[ 0 ] ) : message;
	};

	submitSupportForumsTopic = ( contactForm ) => {
		const {
			helpSiteIsJetpack,
			helpSiteIsNotWpCom,
			helpSiteIsWpCom,
			site,
			subject,
			message,
			userDeclaresNoSite,
			userDeclaredUrl,
			userRequestsHidingUrl,
		} = contactForm;
		const { currentUserLocale } = this.props;

		this.setState( { isSubmitting: true } );
		this.recordCompactSubmit( 'forums' );

		let blogHelpMessage = this.translateForForums(
			"I don't have a site linked to this WordPress.com account"
		);

		if ( userDeclaresNoSite ) {
			blogHelpMessage = this.translateForForums( "I don't have a site with WordPress.com yet" );
		}

		let siteUrl = '';
		if ( site || userDeclaredUrl ) {
			siteUrl = userDeclaredUrl ? userDeclaredUrl.trim() : site.URL;

			blogHelpMessage = '';
			if ( helpSiteIsWpCom ) {
				blogHelpMessage += '\n' + this.translateForForums( 'WP.com: Yes' );
			}

			if ( helpSiteIsNotWpCom ) {
				const jetpackMessage = helpSiteIsJetpack
					? this.translateForForums( 'Yes' )
					: this.translateForForums( 'Unknown' );

				blogHelpMessage +=
					'\n' +
					this.translateForForums( 'WP.com: Unknown \nJetpack: %s', {
						args: [ jetpackMessage ],
					} );
			}

			const correctAccountMessage = userDeclaredUrl
				? this.translateForForums( 'Unknown' )
				: this.translateForForums( 'Yes' );

			blogHelpMessage +=
				'\n' +
				this.translateForForums( 'Correct account: %s', {
					args: [ correctAccountMessage ],
				} );
		}

		const forumMessage = message + '\n\n' + blogHelpMessage;
		const requestData = {
			subject,
			message: forumMessage,
			locale: currentUserLocale,
			client: config( 'client_slug' ),
			hide_blog_info: userRequestsHidingUrl,
		};

		if ( site ) {
			requestData.blog_id = site.ID;
		}

		if ( siteUrl ) {
			requestData.blog_url = siteUrl;
		}

		wpcom.req
			.post( '/help/forums/support/topics/new', requestData )
			.then( ( data ) => {
				this.setState( {
					isSubmitting: false,
					confirmation: {
						title: this.props.translate( 'Got it!' ),
						message: this.props.translate(
							'Your message has been submitted to our ' + '{{a}}community forums{{/a}}',
							{
								components: {
									a: <a href={ data.topic_URL } />,
								},
							}
						),
					},
				} );

				recordTracksEvent( 'calypso_help_contact_submit', { ticket_type: 'forum' } );

				if ( this.props.activeSupportTickets.length > 0 ) {
					recordTracksEvent( 'calypso_help_contact_submit_with_active_tickets', {
						support_type: 'forum',
						active_ticket_count: this.props.activeSupportTickets.length,
					} );
				}
			} )
			.catch( ( error ) => {
				// TODO: bump a stat here
				this.props.errorNotice( error.message );

				this.setState( { isSubmitting: false } );
			} );

		this.clearSavedContactForm();
	};

	recordCompactSubmit = ( variation ) => {
		if ( this.props.compact ) {
			this.props.recordTracksEventAction( 'calypso_inlinehelp_contact_submit', {
				support_variation: variation,
			} );
		}
	};

	getContactFormPropsVariation = ( variationSlug ) => {
		const { isSubmitting } = this.state;
		const { currentUserLocale, hasMoreThanOneSite, translate, localizedLanguageNames } = this.props;
		let buttonLabel = translate( 'Chat with us' );
		const languageForumAvailable =
			isDefaultLocale( currentUserLocale ) ||
			localizeUrl( 'https://en.forums.wordpress.com/' ) !== 'https://en.forums.wordpress.com/';

		switch ( variationSlug ) {
			case SUPPORT_HAPPYCHAT: {
				// TEMPORARY: to collect data about the customer preferences, context 1050-happychat-gh
				// for non english customers check if we have full support in their language
				let additionalSupportOption = { enabled: false };

				if ( ! isDefaultLocale( currentUserLocale ) && ! this.props.hasHappychatLocalizedSupport ) {
					// make sure we only record the track once
					if ( ! this.state.wasAdditionalSupportOptionShown ) {
						// track that additional support option is shown
						this.props.recordTracksEventAction(
							'calypso_happychat_a_b_additional_support_option_shown',
							{
								locale: currentUserLocale,
							}
						);
						this.setState( { wasAdditionalSupportOptionShown: true } );
					}

					if ( localizedLanguageNames && localizedLanguageNames[ defaultLanguageSlug ] ) {
						// override chat buttons
						buttonLabel = translate( 'Chat with us in %(defaultLanguage)s', {
							args: {
								defaultLanguage: localizedLanguageNames[ defaultLanguageSlug ].localized,
							},
						} );
					}

					// add additional support option
					additionalSupportOption = {
						enabled: true,
						label: translate( 'Email us' ),
						onSubmit: this.submitKayakoTicket,
					};
				}

				return {
					additionalSupportOption,
					onSubmit: this.startHappychat,
					buttonLabel,
					showSubjectField: false,
					showHowCanWeHelpField: true,
					showHowYouFeelField: true,
					showSiteField: hasMoreThanOneSite,
					showQASuggestions: true,
				};
			}
			case SUPPORT_CHAT_OVERFLOW:
			case SUPPORT_TICKET:
			case SUPPORT_UPWORK_TICKET:
				return {
					onSubmit: this.submitKayakoTicket,
					buttonLabel: isSubmitting ? translate( 'Sending email' ) : translate( 'Email us' ),
					showSubjectField: true,
					showHowCanWeHelpField: true,
					showHowYouFeelField: true,
					showSiteField: hasMoreThanOneSite,
					showQASuggestions: true,
				};

			case SUPPORT_DIRECTLY:
				return {
					onSubmit: this.submitDirectlyQuestion,
					buttonLabel: translate( 'Ask an Expert' ),
					formDescription: translate(
						'Get help from an {{strong}}Expert User{{/strong}} of WordPress.com. ' +
							'These are other users, like yourself, who have been selected because ' +
							'of their knowledge to help answer your questions.' +
							'{{br/}}{{br/}}' +
							'{{strong}}Please do not{{/strong}} provide financial or contact ' +
							'information when submitting this form.',
						{
							components: {
								// Need to use linebreaks since the entire text is wrapped in a <p>...</p>
								br: <br />,
								strong: <strong />,
							},
						}
					),
					showSubjectField: false,
					showHowCanWeHelpField: false,
					showHowYouFeelField: false,
					showSiteField: false,
					showQASuggestions: true,
				};

			default:
				return {
					onSubmit: this.submitSupportForumsTopic,
					buttonLabel: languageForumAvailable
						? translate( 'Ask in the forums' )
						: translate( 'Ask in the English forums' ),
					formDescription: languageForumAvailable
						? translate(
								'Post a new question in our {{strong}}public forums{{/strong}}, ' +
									'where it may be answered by helpful community members, ' +
									'by submitting the form below. ' +
									'{{strong}}Please do not{{/strong}} provide financial or ' +
									'contact information when submitting this form.',
								{
									components: {
										strong: <strong />,
									},
								}
						  )
						: translate(
								'Post a new question in our {{strong}}public forums{{/strong}}, ' +
									'where it may be answered by helpful community members, ' +
									'by submitting the form below. ' +
									'{{strong}}Please do not{{/strong}} provide financial or ' +
									'contact information when submitting this form.' +
									'{{br/}}{{br/}}' +
									"Unfortunately, we don't have a forum available for your language. Therefore, {{strong}}please write your question in English{{/strong}}, as this will be posted to our English forums.",
								{
									components: {
										br: <br />,
										strong: <strong />,
									},
								}
						  ),
					showSubjectField: true,
					showHowCanWeHelpField: false,
					showHowYouFeelField: false,
					showSiteField: true,
					showAlternativeSiteOptionsField: true,
					showHidingUrlOption: true,
					showQASuggestions: true,
				};
		}
	};

	getContactFormCommonProps = ( variationSlug ) => {
		const { isSubmitting } = this.state;
		const { currentUserLocale } = this.props;

		const showHelpLanguagePrompt = this.shouldShowHelpLanguagePrompt(
			variationSlug,
			currentUserLocale
		);

		return {
			compact: this.props.compact,
			selectedSite: this.props.selectedSite,
			disabled: isSubmitting,
			showHelpLanguagePrompt,
			valueLink: {
				value: savedContactForm,
				requestChange: ( contactForm ) => ( savedContactForm = contactForm ),
			},
			variationSlug,
		};
	};

	shouldShowHelpLanguagePrompt = ( variationSlug, currentUserLocale ) => {
		switch ( variationSlug ) {
			case SUPPORT_HAPPYCHAT:
				return ! config( 'livechat_support_locales' ).includes( currentUserLocale );

			case SUPPORT_TICKET:
			case SUPPORT_CHAT_OVERFLOW:
			case SUPPORT_UPWORK_TICKET:
				return (
					! config( 'upwork_support_locales' ).includes( currentUserLocale ) &&
					! [ 'en', 'en-gb' ].includes( currentUserLocale )
				);

			default:
				return false;
		}
	};

	shouldShowTicketRequestErrorNotice = ( variationSlug ) => {
		const { ticketSupportRequestError } = this.props;

		return SUPPORT_HAPPYCHAT !== variationSlug && null != ticketSupportRequestError;
	};

	/**
	 * Before determining which variation to assign, certain async data needs to be in place.
	 * This function helps assess whether we're ready to say which variation the user should see.
	 *
	 * @returns {boolean} Whether all the data is present to determine the variation to show
	 */
	hasDataToDetermineVariation = () => {
		const ticketReadyOrError =
			this.props.ticketSupportConfigurationReady || null != this.props.ticketSupportRequestError;
		const happychatReadyOrDisabled =
			! config.isEnabled( 'happychat' ) || this.props.isHappychatUserEligible !== null;
		const directlyReadyOrError = this.props.isDirectlyReady || this.props.isDirectlyFailed;

		return ticketReadyOrError && happychatReadyOrDisabled && directlyReadyOrError;
	};

	shouldShowPreloadForm = () => {
		const { supportVariation } = this.props;
		const waitingOnDirectly = supportVariation === SUPPORT_DIRECTLY && ! this.props.isDirectlyReady;

		return (
			this.props.isRequestingSites || ! this.hasDataToDetermineVariation() || waitingOnDirectly
		);
	};

	// Modifies passed props for the "compact" contact form style.
	contactFormPropsCompactFilter = ( props ) => {
		if ( this.props.compact ) {
			return Object.assign( props, {
				showSubjectField: false,
				showHowCanWeHelpField: false,
				showHowYouFeelField: false,
				showQASuggestions: false,
			} );
		}
		return props;
	};

	/**
	 * Get the view for the contact page.
	 *
	 * @returns {object} A JSX object that should be rendered
	 */
	getView = () => {
		const { confirmation } = this.state;
		const { activeSupportTickets, compact, supportVariation, translate } = this.props;

		debug( { supportVariation } );

		if ( confirmation ) {
			return <HelpContactConfirmation { ...confirmation } />;
		}

		if ( this.shouldShowPreloadForm() ) {
			return (
				<div className="help-contact__placeholder">
					<h4 className="help-contact__header">Loading contact form</h4>
					<div className="help-contact__textarea" />

					<h4 className="help-contact__header">Loading contact form</h4>
					<div className="help-contact__textarea" />

					<h4 className="help-contact__header">Loading contact form</h4>
					<div className="help-contact__textarea" />
				</div>
			);
		}

		if ( supportVariation === SUPPORT_DIRECTLY && this.props.hasAskedADirectlyQuestion ) {
			// We're taking the Directly confirmation outside the standard `confirmation` state object
			// that other variations use, because we need this to persist even if the component is
			// removed and re-mounted. Using `confirmation` in component state would mean you could
			// ask a new Directy question every time you left the help section and came back.
			const directlyConfirmation = {
				title: translate( "We're on it!" ),
				message: translate(
					'We sent your question to our {{strong}}Expert Users{{/strong}}. ' +
						'You will hear back via email as soon as an Expert has responded ' +
						'(usually within an hour). For now you can close this window or ' +
						'continue using WordPress.com.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			};
			return <HelpContactConfirmation { ...directlyConfirmation } />;
		}

		const contactFormProps = Object.assign(
			this.getContactFormCommonProps( supportVariation ),
			this.contactFormPropsCompactFilter( this.getContactFormPropsVariation( supportVariation ) )
		);

		// Customers sent to Directly, Forums, and Upwork are not affected by live chat closures
		const isUserAffectedByLiveChatClosure =
			[ SUPPORT_DIRECTLY, SUPPORT_FORUM, SUPPORT_UPWORK_TICKET ].indexOf( supportVariation ) === -1;

		const activeTicketCount = activeSupportTickets.length;

		return (
			<div>
				{ activeTicketCount > 0 && (
					<ActiveTicketsNotice count={ activeTicketCount } compact={ compact } />
				) }

				{ isUserAffectedByLiveChatClosure && (
					<>
						<ChatHolidayClosureNotice
							holidayName={ translate( 'Easter', {
								context: 'Holiday name',
							} ) }
							compact={ compact }
							displayAt="2021-03-28 00:00Z"
							closesAt="2021-04-04 00:00Z"
							reopensAt="2021-04-05 06:00Z"
						/>
						<ChatHolidayClosureNotice
							holidayName={ translate( 'Christmas', {
								context: 'Holiday name',
							} ) }
							compact={ compact }
							displayAt="2021-12-17 00:00Z"
							closesAt="2021-12-24 00:00Z"
							reopensAt="2021-12-26 07:00Z"
						/>
						<ChatHolidayClosureNotice
							holidayName={ translate( "New Year's Day", {
								context: 'Holiday name',
							} ) }
							compact={ compact }
							displayAt="2021-12-26 07:00Z"
							closesAt="2021-12-31 00:00Z"
							reopensAt="2022-01-02 07:00Z"
						/>
					</>
				) }

				{ this.shouldShowTicketRequestErrorNotice( supportVariation ) && (
					<Notice
						status="is-warning"
						text={ translate(
							'We had trouble loading the support information for your account. ' +
								'Please check your internet connection and reload the page, or try again later.'
						) }
						showDismiss={ false }
					/>
				) }
				<HelpContactForm { ...contactFormProps } />
			</div>
		);
	};

	render() {
		const content = (
			<Fragment>
				<PageViewTracker path="/help/contact" title="Help > Contact" />
				{ ! this.props.compact && (
					<HeaderCake onClick={ this.backToHelp } isCompact={ true }>
						{ this.props.translate( 'Contact Us' ) }
					</HeaderCake>
				) }
				{ ! this.props.compact && ! this.props.isEmailVerified && <HelpUnverifiedWarning /> }
				<Card className="help-contact__form">{ this.getView() }</Card>
				{ this.props.shouldStartHappychatConnection && <HappychatConnection /> }
				{ ! this.props.compact && <QuerySupportHistory email={ this.props.currentUser.email } /> }
				<QueryTicketSupportConfiguration />
				<QueryUserPurchases />
				<QueryLanguageNames />
			</Fragment>
		);
		if ( this.props.compact ) {
			return content;
		}
		return <Main className="help-contact">{ content }</Main>;
	}
}

export default connect(
	( state ) => {
		const selectedSite = getHelpSelectedSite( state );
		return {
			selectedSite,
			currentUserLocale: getCurrentUserLocale( state ),
			currentUser: getCurrentUser( state ),
			getUserInfo: getHappychatUserInfo( state ),
			hasHappychatLocalizedSupport: hasHappychatLocalizedSupport( state ),
			hasAskedADirectlyQuestion: hasUserAskedADirectlyQuestion( state ),
			isDirectlyFailed: isDirectlyFailed( state ),
			isDirectlyReady: isDirectlyReady( state ),
			isDirectlyUninitialized: isDirectlyUninitialized( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
			isHappychatUserEligible: isHappychatUserEligible( state ),
			localizedLanguageNames: getLocalizedLanguageNames( state ),
			ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
			ticketSupportRequestError: getTicketSupportRequestError( state ),
			hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
			shouldStartHappychatConnection: ! isRequestingSites( state ) && selectedSite,
			isRequestingSites: isRequestingSites( state ),
			supportVariation: getInlineHelpSupportVariation( state ),
			activeSupportTickets: getActiveSupportTickets( state ),
		};
	},
	{
		askDirectlyQuestion,
		errorNotice,
		initializeDirectly,
		openHappychat,
		recordTracksEventAction,
		sendHappychatMessage,
		sendUserInfo,
	}
)( localize( HelpContact ) );
