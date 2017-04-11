/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import Main from 'components/main';
import Card from 'components/card';
import Notice from 'components/notice';
import OlarkChatbox from 'components/olark-chatbox';
import olarkStore from 'lib/olark-store';
import olarkActions from 'lib/olark-store/actions';
import olarkEvents from 'lib/olark-events';
import HelpContactForm from 'me/help/help-contact-form';
import HelpContactClosed from 'me/help/help-contact-closed';
import HelpContactConfirmation from 'me/help/help-contact-confirmation';
import HeaderCake from 'components/header-cake';
import wpcomLib from 'lib/wp';
import notices from 'notices';
import siteList from 'lib/sites-list';
import analytics from 'lib/analytics';
import { isOlarkTimedOut } from 'state/ui/olark/selectors';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { isHappychatAvailable } from 'state/happychat/selectors';
import { isTicketSupportEligible, isTicketSupportConfigurationReady, getTicketSupportRequestError } from 'state/help/ticket/selectors';
import HappychatConnection from 'components/happychat/connection';
import QueryOlark from 'components/data/query-olark';
import QueryTicketSupportConfiguration from 'components/data/query-ticket-support-configuration';
import HelpUnverifiedWarning from '../help-unverified-warning';
import { sendChatMessage as sendHappychatMessage, sendBrowserInfo } from 'state/happychat/actions';
import { openChat as openHappychat } from 'state/ui/happychat/actions';
import { getCurrentUser, getCurrentUserLocale } from 'state/current-user/selectors';
import { askQuestion as askDirectlyQuestion, initialize as initializeDirectly } from 'state/help/directly/actions';
import {
	isDirectlyFailed,
	isDirectlyReady,
	isDirectlyUninitialized,
} from 'state/selectors';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();
const sites = siteList();
let savedContactForm = null;

const SUPPORT_DIRECTLY = 'SUPPORT_DIRECTLY';
const SUPPORT_HAPPYCHAT = 'SUPPORT_HAPPYCHAT';
const SUPPORT_LIVECHAT = 'SUPPORT_LIVECHAT';
const SUPPORT_TICKET = 'SUPPORT_TICKET';
const SUPPORT_FORUM = 'SUPPORT_FORUM';

const HelpContact = React.createClass( {

	componentDidMount: function() {
		this.prepareDirectlyWidget();

		olarkStore.on( 'change', this.updateOlarkState );
		olarkEvents.on( 'api.chat.onOperatorsAway', this.onOperatorsAway );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', this.onOperatorsAvailable );
		olarkEvents.on( 'api.chat.onCommandFromOperator', this.onCommandFromOperator );
		olarkEvents.on( 'api.chat.onMessageToVisitor', this.onMessageToVisitor );
		olarkEvents.on( 'api.chat.onMessageToOperator', this.onMessageToOperator );

		sites.on( 'change', this.onSitesChanged );

		olarkActions.updateDetails();

		// The following lines trick olark into thinking we are interacting with it. This interaction
		// makes olark fire off its onOperatorsAway and onOperatorsAvailable events sooner.
		olarkActions.expandBox();
		olarkActions.shrinkBox();
		olarkActions.hideBox();
	},

	componentDidUpdate: function() {
		// Directly initialization is a noop if it's already happened. This catches
		// instances where a state/prop change moves a user to Directly support from
		// some other variation.
		this.prepareDirectlyWidget();
	},

	componentWillUnmount: function() {
		const { details, isOperatorAvailable } = this.state.olark;

		olarkStore.removeListener( 'change', this.updateOlarkState );
		olarkEvents.off( 'api.chat.onOperatorsAway', this.onOperatorsAway );
		olarkEvents.off( 'api.chat.onOperatorsAvailable', this.onOperatorsAvailable );
		olarkEvents.off( 'api.chat.onCommandFromOperator', this.onCommandFromOperator );
		olarkEvents.off( 'api.chat.onMessageToVisitor', this.onMessageToVisitor );
		olarkEvents.off( 'api.chat.onMessageToOperator', this.onMessageToOperator );

		if ( details.isConversing && ! isOperatorAvailable ) {
			olarkActions.shrinkBox();
		}

		sites.removeListener( 'change', this.onSitesChanged );
	},

	getInitialState: function() {
		return {
			olark: olarkStore.get(),
			isSubmitting: false,
			confirmation: null,
			isChatEnded: false,
			sitesInitialized: sites.initialized
		};
	},

	updateOlarkState: function() {
		this.setState( { olark: olarkStore.get() } );
	},

	onSitesChanged: function() {
		this.setState( { sitesInitialized: sites.initialized } );
	},

	backToHelp: function() {
		page( '/help' );
	},

	clearSavedContactForm: function() {
		savedContactForm = null;
	},

	startHappychat: function( contactForm ) {
		this.props.openHappychat();
		const { message, siteId } = contactForm;
		const site = sites.getSite( siteId );

		this.props.sendBrowserInfo( site.URL );
		this.props.sendHappychatMessage( message );

		analytics.tracks.recordEvent( 'calypso_help_live_chat_begin', {
			site_plan_product_id: ( site ? site.plan.product_id : null )
		} );

		page( '/help' );
	},

	startChat: function( contactForm ) {
		const { message, howCanWeHelp, howYouFeel, siteSlug } = contactForm;
		const site = sites.getSite( siteSlug );

		// Intentionally not translated since only HE's will see this in the olark console as a notification.
		const notifications = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' )
		];

		notifications.forEach( olarkActions.sendNotificationToOperator );

		analytics.tracks.recordEvent( 'calypso_help_live_chat_begin', {
			site_plan_product_id: ( site ? site.plan.product_id : null )
		} );

		this.sendMessageToOperator( message );

		this.clearSavedContactForm();
	},

	prepareDirectlyWidget: function() {
		if (
			this.hasDataToDetermineVariation() &&
			this.getSupportVariation() === SUPPORT_DIRECTLY &&
			this.props.isDirectlyUninitialized
		) {
			this.props.initializeDirectly();
		}
	},

	submitDirectlyQuestion: function( contactForm ) {
		const { display_name, email } = this.props.currentUser;

		this.props.askDirectlyQuestion(
			contactForm.message,
			display_name,
			email
		);

		this.clearSavedContactForm();

		page( '/help' );
	},

	submitKayakoTicket: function( contactForm ) {
		const { subject, message, howCanWeHelp, howYouFeel, siteSlug } = contactForm;
		const { currentUserLocale } = this.props;
		const site = sites.getSite( siteSlug );

		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' )
		];

		const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );

		wpcom.submitKayakoTicket( subject, kayakoMessage, currentUserLocale, this.props.clientSlug, ( error ) => {
			if ( error ) {
				// TODO: bump a stat here
				notices.error( error.message );

				this.setState( { isSubmitting: false } );
				return;
			}

			this.setState( {
				isSubmitting: false,
				confirmation: {
					title: this.props.translate( 'We\'re on it!' ),
					message: this.props.translate(
						'We\'ve received your message, and you\'ll hear back from ' +
						'one of our Happiness Engineers shortly.'
					)
				}
			} );

			analytics.tracks.recordEvent( 'calypso_help_contact_submit', {
				ticket_type: 'kayako',
				site_plan_product_id: ( site ? site.plan.product_id : null )
			} );
		} );

		this.clearSavedContactForm();
	},

	submitSupportForumsTopic: function( contactForm ) {
		const { subject, message } = contactForm;
		const { currentUserLocale } = this.props;

		this.setState( { isSubmitting: true } );

		wpcom.submitSupportForumsTopic( subject, message, currentUserLocale, this.props.clientSlug, ( error, data ) => {
			if ( error ) {
				// TODO: bump a stat here
				notices.error( error.message );

				this.setState( { isSubmitting: false } );
				return;
			}

			this.setState( {
				isSubmitting: false,
				confirmation: {
					title: this.props.translate( 'Got it!' ),
					message: this.props.translate(
						'Your message has been submitted to our ' +
						'{{a}}community forums{{/a}}',
						{
							components: {
								a: <a href={ data.topic_URL } />
							}
						}
					)
				}
			} );

			analytics.tracks.recordEvent( 'calypso_help_contact_submit', { ticket_type: 'forum' } );
		} );

		this.clearSavedContactForm();
	},

	/**
	 * Send a message to an olark operator.
	 * @param  {string} message The message to be sent to an operator
	 */
	sendMessageToOperator: function( message ) {
		// Get the DOM element of the olark textarea
		const widgetInput = window.document.getElementById( 'habla_wcsend_input' );
		const KEY_ENTER = 13;

		if ( ! widgetInput ) {
			// We couldn't find the input box in the olark widget so return false since we can't send the message
			return;
		}

		// Theres no api call that sends a message to an operator so in order to achieve this we send a fake
		// "enter" keypress event that olark will be listening for. The enter key event is what then triggers the sending of
		// the message.

		// Show the olark box so that we may manipulate it.
		// You can only send a message when the olark box is expanded.
		olarkActions.expandBox();

		// Send focus to the textarea because olark expects it.
		widgetInput.focus();

		// IE requires this to be executed before the value is set, don't know why.
		widgetInput.onkeydown( { keyCode: KEY_ENTER } );
		widgetInput.value = message;

		// Trigger the onkeydown callback added by olark so that we can send the message to the operator.
		widgetInput.onkeydown( { keyCode: KEY_ENTER } );
	},

	onMessageToVisitor: function() {
		this.trackChatDisplayError( 'onMessageToVisitor' );
	},

	onMessageToOperator: function() {
		this.trackChatDisplayError( 'onMessageToOperator' );
	},

	trackChatDisplayError: function( olarkEvent ) {
		const { olark, isChatEnded } = this.state;

		// If the user sent/received a message to/from an operator but the chatbox is not inlined
		// then something must be going wrong. Lets record this event and give some details
		if ( this.canShowChatbox() ) {
			return;
		}

		const tracksData = {
			olark_event: olarkEvent,
			olark_locale: olark.locale,
			olark_is_chat_ended: isChatEnded,
			olark_is_ready: olark.isOlarkReady,
			olark_is_expanded: olark.isOlarkExpanded,
			olark_is_user_eligible: olark.isUserEligible,
			olark_is_operator_available: olark.isOperatorAvailable
		};

		// Do a check here to make sure that details are present because an error in the
		// olark event stack could cause it to be null/undefined
		if ( olark.details ) {
			tracksData.olark_is_conversing = olark.details.isConversing;
		} else {
			tracksData.olark_details_missing = true;
		}

		analytics.tracks.recordEvent( 'calypso_help_contact_chatbox_mistaken_display', tracksData );
	},

	trackContactFormAndFillSubject() {
		const { details } = this.state.olark;
		if ( ! details.isConversing ) {
			analytics.tracks.recordEvent( 'calypso_help_offline_form_display', {
				form_type: 'kayako'
			} );
		}
		this.autofillSubject();
	},

	onOperatorsAway: function() {
		const IS_UNAVAILABLE = false;
		this.trackContactFormAndFillSubject();
		this.showAvailabilityNotice( IS_UNAVAILABLE );
	},

	onOperatorsAvailable: function() {
		const IS_AVAILABLE = true;

		this.showAvailabilityNotice( IS_AVAILABLE );
	},

	showAvailabilityNotice( isAvailable ) {
		const { isUserEligible, isOlarkReady } = this.state.olark;

		if ( ! isOlarkReady || ! isUserEligible ) {
			return;
		}

		if ( isAvailable ) {
			notices.success( this.props.translate( 'Our Happiness Engineers have returned, chat with us.' ) );
		} else {
			notices.warning( this.props.translate( 'Sorry! We just missed you as our Happiness Engineers stepped away.' ) );
		}
	},

	/**
	 * Auto fill the subject with the first five words contained in the message field of the contact form.
	 */
	autofillSubject: function() {
		if ( ! savedContactForm || ! savedContactForm.message || savedContactForm.subject ) {
			return;
		}

		const words = savedContactForm.message.split( /\s+/ );

		savedContactForm = Object.assign( savedContactForm, { subject: words.slice( 0, 5 ).join( ' ' ) + '…' } );

		this.forceUpdate();
	},

	onCommandFromOperator: function( event ) {
		if ( event.command.name === 'end' ) {
			this.setState( { isChatEnded: true } );
		}
	},

	shouldUseHappychat: function() {
		const { olark } = this.state;

		// if happychat is disabled in the config, do not use it
		if ( ! config.isEnabled( 'happychat' ) ) {
			return false;
		}

		// if the happychat connection is able to accept chats, use it
		return this.props.isHappychatAvailable && olark.isUserEligible;
	},

	shouldUseDirectly: function() {
		const isEn = this.props.currentUserLocale === 'en';
		return (
			isEn &&
			! this.props.isDirectlyFailed
		);
	},

	canShowChatbox: function() {
		const { olark, isChatEnded } = this.state;
		return isChatEnded || ( olark.details.isConversing && olark.isOperatorAvailable );
	},

	getSupportVariation: function() {
		const { olark } = this.state;
		const { ticketSupportEligible } = this.props;

		if ( this.shouldUseHappychat() ) {
			return SUPPORT_HAPPYCHAT;
		}

		if ( olark.isUserEligible && olark.isOperatorAvailable ) {
			return SUPPORT_LIVECHAT;
		}

		if ( olark.details.isConversing || ticketSupportEligible ) {
			return SUPPORT_TICKET;
		}

		if ( this.shouldUseDirectly() ) {
			return SUPPORT_DIRECTLY;
		}

		return SUPPORT_FORUM;
	},

	getContactFormPropsVariation: function( variationSlug ) {
		const { isSubmitting } = this.state;
		const { translate } = this.props;
		const hasMoreThanOneSite = sites.get().length > 1;

		switch ( variationSlug ) {
			case SUPPORT_HAPPYCHAT:
				const isDev = ( ( config( 'env' ) === 'development' ) || ( config( 'env_id' ) === 'stage' ) );
				return {
					onSubmit: this.startHappychat,
					buttonLabel: isDev ? 'Happychat' : translate( 'Chat with us' ),
					showSubjectField: false,
					showHowCanWeHelpField: true,
					showHowYouFeelField: true,
					showSiteField: hasMoreThanOneSite,
				};

			case SUPPORT_LIVECHAT:
				return {
					onSubmit: this.startChat,
					buttonLabel: translate( 'Chat with us' ),
					showSubjectField: false,
					showHowCanWeHelpField: true,
					showHowYouFeelField: true,
					showSiteField: hasMoreThanOneSite,
				};

			case SUPPORT_TICKET:
				return {
					onSubmit: this.submitKayakoTicket,
					buttonLabel: isSubmitting ? translate( 'Sending email' ) : translate( 'Email us' ),
					showSubjectField: true,
					showHowCanWeHelpField: true,
					showHowYouFeelField: true,
					showSiteField: hasMoreThanOneSite,
				};

			case SUPPORT_DIRECTLY:
				return {
					onSubmit: this.submitDirectlyQuestion,
					buttonLabel: translate( 'Ask an Expert' ),
					formDescription: translate(
						'Chat with an {{strong}}Expert User{{/strong}} of WordPress.com. ' +
						'These are other users, like yourself, that have been selected ' +
						'because of their knowledge to help answer your questions. ' +
						'{{strong}}Please do not{{/strong}} provide financial or ' +
						'contact information when submitting this form.',
						{
							components: {
								strong: <strong />
							}
						} ),
					showSubjectField: false,
					showHowCanWeHelpField: false,
					showHowYouFeelField: false,
					showSiteField: false,
				};

			default:
				return {
					onSubmit: this.submitSupportForumsTopic,
					buttonLabel: isSubmitting ? translate( 'Asking in the forums' ) : translate( 'Ask in the forums' ),
					formDescription: translate(
						'Post a new question in our {{strong}}public forums{{/strong}}, ' +
						'where it may be answered by helpful community members, ' +
						'by submitting the form below. ' +
						'{{strong}}Please do not{{/strong}} provide financial or ' +
						'contact information when submitting this form.',
						{
							components: {
								strong: <strong />
							}
						} ),
					showSubjectField: true,
					showHowCanWeHelpField: false,
					showHowYouFeelField: false,
					showSiteField: false,
				};
		}
	},

	getContactFormCommonProps: function( variationSlug ) {
		const { isSubmitting } = this.state;
		const { currentUserLocale } = this.props;

		// Let the user know we only offer support in English.
		// We only need to show the message if:
		// 1. The user's locale doesn't match the live chat locale (usually English)
		// 2. The support request isn't sent to the forums. Because forum support
		//    requests are sent to the language specific forums (for popular languages)
		//    we don't tell the user that support is only offered in English.
		const showHelpLanguagePrompt =
			( config( 'support_locales' ).indexOf( currentUserLocale ) === -1 ) &&
			SUPPORT_FORUM !== variationSlug;

		return {
			disabled: isSubmitting,
			showHelpLanguagePrompt: showHelpLanguagePrompt,
			valueLink: { value: savedContactForm, requestChange: ( contactForm ) => savedContactForm = contactForm }
		};
	},

	shouldShowTicketRequestErrorNotice: function( variationSlug ) {
		const { ticketSupportRequestError } = this.props;

		return SUPPORT_HAPPYCHAT !== variationSlug && SUPPORT_LIVECHAT !== variationSlug && null != ticketSupportRequestError;
	},

	/**
	 * Before determining which variation to assign, certain async data needs to be in place.
	 * This function helps assess whether we're ready to say which variation the user should see.
	 *
	 * @returns {Boolean} Whether all the data is present to determine the variation to show
	 */
	hasDataToDetermineVariation: function() {
		const { olark } = this.state;
		const { ticketSupportConfigurationReady, ticketSupportRequestError } = this.props;

		const olarkReadyOrTimedOut = olark.isOlarkReady || this.props.olarkTimedOut;
		const ticketReadyOrError = ticketSupportConfigurationReady || null != ticketSupportRequestError;

		return olarkReadyOrTimedOut && ticketReadyOrError;
	},

	shouldShowPreloadForm: function() {
		const { sitesInitialized } = this.state;
		const waitingOnDirectly = this.getSupportVariation() === SUPPORT_DIRECTLY && ! this.props.isDirectlyReady;

		return ! sitesInitialized || ! this.hasDataToDetermineVariation() || waitingOnDirectly;
	},

	/**
	 * Get the view for the contact page. This could either be the olark chat widget if a chat is in progress or a contact form.
	 * @return {object} A JSX object that should be rendered
	 */
	getView: function() {
		const { olark, confirmation } = this.state;

		if ( confirmation ) {
			return <HelpContactConfirmation { ...confirmation } />;
		}

		if ( olark.isSupportClosed ) {
			return <HelpContactClosed />;
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

		if ( this.canShowChatbox() ) {
			return <OlarkChatbox />;
		}

		// Hide the olark widget in the bottom right corner.
		olarkActions.hideBox();

		const supportVariation = this.getSupportVariation();

		const contactFormProps = Object.assign(
			this.getContactFormCommonProps( supportVariation ),
			this.getContactFormPropsVariation( supportVariation ),
		);

		return (
			<div>
				{ this.shouldShowTicketRequestErrorNotice( supportVariation ) &&
					<Notice
						status="is-warning"
						text={ this.props.translate( 'We had trouble loading the support information for your account. ' +
							'Please check your internet connection and reload the page, or try again later.' ) }
						showDismiss={ false }
					/>
				}
				<HelpContactForm { ...contactFormProps } />
			</div>
		);
	},

	render: function() {
		return (
			<Main className="help-contact">
				<HeaderCake onClick={ this.backToHelp } isCompact={ true }>{ this.props.translate( 'Contact Us' ) }</HeaderCake>
				{ ! this.props.isEmailVerified && <HelpUnverifiedWarning /> }
				<Card className={ this.canShowChatbox() ? 'help-contact__chat-form' : 'help-contact__form' }>
					{ this.getView() }
				</Card>
				<HappychatConnection />
				<QueryOlark />
				<QueryTicketSupportConfiguration />
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			currentUserLocale: getCurrentUserLocale( state ),
			currentUser: getCurrentUser( state ),
			isDirectlyFailed: isDirectlyFailed( state ),
			isDirectlyReady: isDirectlyReady( state ),
			isDirectlyUninitialized: isDirectlyUninitialized( state ),
			olarkTimedOut: isOlarkTimedOut( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
			isHappychatAvailable: isHappychatAvailable( state ),
			ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
			ticketSupportEligible: isTicketSupportEligible( state ),
			ticketSupportRequestError: getTicketSupportRequestError( state ),
		};
	},
	{
		openHappychat,
		sendHappychatMessage,
		sendBrowserInfo,
		askDirectlyQuestion,
		initializeDirectly,
	}
)( localize( HelpContact ) );
