/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import OlarkChatbox from 'components/olark-chatbox';
import olarkStore from 'lib/olark-store';
import olarkActions from 'lib/olark-store/actions';
import olarkEvents from 'lib/olark-events';
import olarkApi from 'lib/olark-api';
import HelpContactForm from 'me/help/help-contact-form';
import HelpContactConfirmation from 'me/help/help-contact-confirmation';
import HeaderCake from 'components/header-cake';
import wpcomLib from 'lib/wp';
import notices from 'notices';
import siteList from 'lib/sites-list';
import analytics from 'lib/analytics';
import i18n from 'lib/i18n-utils';
import { isOlarkTimedOut } from 'state/ui/olark/selectors';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import QueryOlark from 'components/data/query-olark';
import HelpUnverifiedWarning from '../help-unverified-warning';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();
const sites = siteList();
let savedContactForm = null;

const HelpContact = React.createClass( {

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.olarkTimedOut && this.olarkTimedOut !== nextProps.olarkTimedOut ) {
			this.onOlarkUnavailable();
		}
	},

	componentDidMount: function() {
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

		analytics.tracks.recordEvent( 'calypso_help_live_chat_begin' );

		this.sendMessageToOperator( message );

		this.clearSavedContactForm();
	},

	submitKayakoTicket: function( contactForm ) {
		const { subject, message, howCanWeHelp, howYouFeel, siteSlug } = contactForm;
		const { locale } = this.state.olark;
		const site = sites.getSite( siteSlug );

		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' )
		];

		const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );

		wpcom.submitKayakoTicket( subject, kayakoMessage, locale, this.props.clientSlug, ( error ) => {
			if ( error ) {
				// TODO: bump a stat here
				notices.error( error.message );

				this.setState( { isSubmitting: false } );
				return;
			}

			this.setState( {
				isSubmitting: false,
				confirmation: {
					title: this.translate( 'We\'re on it!' ),
					message: this.translate(
						'We\'ve received your message, and you\'ll hear back from ' +
						'one of our Happiness Engineers shortly.' )
				}
			} );

			analytics.tracks.recordEvent( 'calypso_help_contact_submit', { ticket_type: 'kayako' } );
		} );

		this.clearSavedContactForm();
	},

	submitSupportForumsTopic: function( contactForm ) {
		const { subject, message } = contactForm;

		this.setState( { isSubmitting: true } );

		wpcom.submitSupportForumsTopic( subject, message, this.props.clientSlug, ( error, data ) => {
			if ( error ) {
				// TODO: bump a stat here
				notices.error( error.message );

				this.setState( { isSubmitting: false } );
				return;
			}

			this.setState( {
				isSubmitting: false,
				confirmation: {
					title: this.translate( 'Got it!' ),
					message: this.translate(
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

		// Lets call the olark API directly to see if the value we get differs from what our olark store has.
		olarkApi( 'api.visitor.getDetails', ( details ) => {
			const data = {
				olark_event: olarkEvent,
				olark_is_conversing: details.isConversing,
			};

			// This does a separate tracks ping just incase the error is occuring in the olark api call
			analytics.tracks.recordEvent( 'calypso_help_contact_chatbox_mistaken_display_got_details', data );
		} );
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

	onOlarkUnavailable() {
		this.trackContactFormAndFillSubject();
		this.showTimeoutNotice();
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
			notices.success( this.translate( 'Our Happiness Engineers have returned, chat with us.' ) );
		} else {
			notices.warning( this.translate( 'Sorry! We just missed you as our Happiness Engineers stepped away.' ) );
		}
	},

	showTimeoutNotice() {
		const { isUserEligible, isOlarkReady } = this.state.olark;

		if ( ! isUserEligible || isOlarkReady ) {
			return;
		}
		notices.warning( this.translate( 'Our chat tools did not load. If you have an adblocker please disable it and refresh this page.' ) );
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

	canShowChatbox: function() {
		const { olark, isChatEnded } = this.state;

		return isChatEnded || ( olark.details.isConversing && olark.isOperatorAvailable );
	},

	/**
	 * Get the view for the contact page. This could either be the olark chat widget if a chat is in progress or a contact form.
	 * @return {object} A JSX object that should be rendered
	 */
	getView: function() {
		const { olark, confirmation, sitesInitialized, isSubmitting } = this.state;
		const showChatVariation = olark.isUserEligible && olark.isOperatorAvailable;
		const showKayakoVariation = ! showChatVariation && ( olark.details.isConversing || olark.isUserEligible );
		const showForumsVariation = ! ( showChatVariation || showKayakoVariation );
		const showHelpLanguagePrompt = ( olark.locale !== i18n.getLocaleSlug() );

		if ( confirmation ) {
			return <HelpContactConfirmation { ...confirmation } />;
		}

		if ( ! ( olark.isOlarkReady && sitesInitialized ) && ! this.props.olarkTimedOut ) {
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

		const contactFormProps = Object.assign(
			{
				disabled: isSubmitting,
				showSubjectField: showKayakoVariation || showForumsVariation,
				showHowCanWeHelpField: showKayakoVariation || showChatVariation,
				showHowYouFeelField: showKayakoVariation || showChatVariation,
				showSiteField: ( showKayakoVariation || showChatVariation ) && ( sites.get().length > 1 ),
				showHelpLanguagePrompt: showHelpLanguagePrompt,
				valueLink: { value: savedContactForm, requestChange: ( contactForm ) => savedContactForm = contactForm }
			},
			showChatVariation && {
				onSubmit: this.startChat,
				buttonLabel: this.translate( 'Chat with us' )
			},
			showKayakoVariation && {
				onSubmit: this.submitKayakoTicket,
				buttonLabel: isSubmitting ? this.translate( 'Submitting support ticket' ) : this.translate( 'Submit support ticket' )
			},
			showForumsVariation && {
				onSubmit: this.submitSupportForumsTopic,
				buttonLabel: isSubmitting ? this.translate( 'Asking in the forums' ) : this.translate( 'Ask in the forums' ),
				formDescription: this.translate(
					'Post a new question in our {{strong}}public forums{{/strong}}, ' +
					'where it may be answered by helpful community members, ' +
					'by submitting the form below. ' +
					'{{strong}}Please do not{{/strong}} provide financial or ' +
					'contact information when submitting this form.',
					{
						components: {
							strong: <strong />
						}
					} )
			}
		);

		// Hide the olark widget in the bottom right corner.
		olarkActions.hideBox();

		return <HelpContactForm { ...contactFormProps } />;
	},

	render: function() {
		return (
			<Main className="help-contact">
				<HeaderCake onClick={ this.backToHelp } isCompact={ true }>{ this.translate( 'Contact Us' ) }</HeaderCake>
				{ ! this.props.isEmailVerified && <HelpUnverifiedWarning /> }
				<Card className={ this.canShowChatbox() ? 'help-contact__chat-form' : 'help-contact__form' }>
					{ this.getView() }
				</Card>
				<QueryOlark />
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			olarkTimedOut: isOlarkTimedOut( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
		};
	}
)( HelpContact );
