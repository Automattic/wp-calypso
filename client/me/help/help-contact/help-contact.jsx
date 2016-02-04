/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import OlarkChatbox from 'components/olark-chatbox';
import olarkEvents from 'lib/olark-events';
import HelpContactForm from 'me/help/help-contact-form';
import HelpContactConfirmation from 'me/help/help-contact-confirmation';
import HeaderCake from 'components/header-cake';
import wpcomLib from 'lib/wp';
import notices from 'notices';
import siteList from 'lib/sites-list';
import analytics from 'analytics';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();
const sites = siteList();
let savedContactForm = null;

module.exports = React.createClass( {
	displayName: 'HelpContact',

	propTypes: {
		expandOlarkBox: PropTypes.func.isRequired,
		hideOlarkBox: PropTypes.func.isRequired,
		sendOlarkNotificationToOperator: PropTypes.func.isRequired,
		shrinkOlarkBox: PropTypes.func.isRequired,
		updateOlarkDetails: PropTypes.func.isRequired
	},

	componentDidMount: function() {
		olarkEvents.on( 'api.chat.onOperatorsAway', this.onOperatorsAway );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', this.onOperatorsAvailable );
		olarkEvents.on( 'api.chat.onCommandFromOperator', this.onCommandFromOperator );
		olarkEvents.on( 'api.box.onShow', this.hideOlarkBox );
		olarkEvents.on( 'api.box.onExpand', this.hideOlarkBox );

		sites.on( 'change', this.onSitesChanged );

		this.props.updateOlarkDetails();

		// The following lines trick olark into thinking we are interacting with it. This interaction
		// makes olark fire off its onOperatorsAway and onOperatorsAvailable events sooner.
		this.props.expandOlarkBox();
		this.props.shrinkOlarkBox();
		this.props.hideOlarkBox();
	},

	componentWillUnmount: function() {
		const { details, isOperatorAvailable } = this.props.olark;

		olarkEvents.off( 'api.chat.onOperatorsAway', this.onOperatorsAway );
		olarkEvents.off( 'api.chat.onOperatorsAvailable', this.onOperatorsAvailable );
		olarkEvents.off( 'api.chat.onCommandFromOperator', this.onCommandFromOperator );
		olarkEvents.off( 'api.box.onShow', this.hideOlarkBox );
		olarkEvents.off( 'api.box.onExpand', this.hideOlarkBox );

		if ( details.isConversing && ! isOperatorAvailable ) {
			this.props.shrinkOlarkBox();
		}

		sites.removeListener( 'change', this.onSitesChanged );
	},

	getInitialState: function() {
		return {
			isSubmitting: false,
			confirmation: null,
			isChatEnded: false,
			sitesInitialized: sites.initialized
		};
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

	hideOlarkBox: function() {
		if ( this.canShowChatbox() ) {
			return;
		}

		// Hide the olark widget in the bottom right corner.
		this.props.shrinkOlarkBox();
		this.props.hideOlarkBox();
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

		notifications.forEach( this.props.sendOlarkNotificationToOperator );

		analytics.tracks.recordEvent( 'calypso_help_live_chat_begin' );

		this.sendMessageToOperator( message );

		this.clearSavedContactForm();
	},

	submitKayakoTicket: function( contactForm ) {
		const { subject, message, howCanWeHelp, howYouFeel, siteSlug } = contactForm;
		const { locale } = this.props.olark;
		const site = sites.getSite( siteSlug );

		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' )
		];

		const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );

		wpcom.submitKayakoTicket( subject, kayakoMessage, locale, ( error ) => {
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

		wpcom.submitSupportForumsTopic( subject, message, ( error, data ) => {
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
		this.props.expandOlarkBox();

		// Send focus to the textarea because olark expects it.
		widgetInput.focus();

		// IE requires this to be executed before the value is set, don't know why.
		widgetInput.onkeydown( { keyCode: KEY_ENTER } );
		widgetInput.value = message;

		// Trigger the onkeydown callback added by olark so that we can send the message to the operator.
		widgetInput.onkeydown( { keyCode: KEY_ENTER } );
	},

	onOperatorsAway: function() {
		const IS_UNAVAILABLE = false;
		const { details } = this.props.olark;

		if ( ! details.isConversing ) {
			analytics.tracks.recordEvent( 'calypso_help_offline_form_display', {
				form_type: 'kayako'
			} );
		}

		//Autofill the subject field since we will be showing it now that operators have went away.
		this.autofillSubject();

		this.showAvailabilityNotice( IS_UNAVAILABLE );
	},

	onOperatorsAvailable: function() {
		const IS_AVAILABLE = true;

		this.showAvailabilityNotice( IS_AVAILABLE );
	},

	showAvailabilityNotice( isAvailable ) {
		const { isUserEligible, isOlarkReady } = this.props.olark;

		if ( ! isOlarkReady || ! isUserEligible ) {
			return;
		}

		if ( isAvailable ) {
			notices.success( this.translate( 'Our Happiness Engineers have returned, chat with us.' ) );
		} else {
			notices.warning( this.translate( 'Sorry! We just missed you as our Happiness Engineers stepped away.' ) );
		}
	},

	/**
	 * Auto fill the subject with the first five words contained in the message field of the contact form.
	 */
	autofillSubject: function() {
		if ( ! savedContactForm.message || savedContactForm.subject ) {
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
		const { isChatEnded } = this.state;
		const { olark } = this.props;

		return isChatEnded || ( olark.details.isConversing && olark.isOperatorAvailable );
	},

	/**
	 * Get the view for the contact page. This could either be the olark chat widget if a chat is in progress or a contact form.
	 * @return {object} A JSX object that should be rendered
	 */
	getView: function() {
		const { confirmation, sitesInitialized, isSubmitting } = this.state;
		const { olark } = this.props;
		const showChatVariation = olark.isUserEligible && olark.isOperatorAvailable;
		const showKayakoVariation = ! showChatVariation && ( olark.details.isConversing || olark.isUserEligible );
		const showForumsVariation = ! ( showChatVariation || showKayakoVariation );

		if ( confirmation ) {
			return <HelpContactConfirmation { ...confirmation } />;
		}

		if ( ! ( olark.isOlarkReady && sitesInitialized ) ) {
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

		return <HelpContactForm { ...contactFormProps } />;
	},

	render: function() {
		return (
			<Main className="help-contact">
				<HeaderCake onClick={ this.backToHelp } isCompact={ true }>{ this.translate( 'Contact Us' ) }</HeaderCake>
				<Card className={ this.canShowChatbox() ? 'help-contact__chat-form' : 'help-contact__form' }>
					{ this.getView() }
				</Card>
			</Main>
		);
	}
} );
