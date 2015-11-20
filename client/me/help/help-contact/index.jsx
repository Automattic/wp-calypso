/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import OlarkChatbox from 'components/olark-chatbox';
import olarkStore from 'lib/olark-store';
import olarkActions from 'lib/olark-store/actions';
import olarkEvents from 'lib/olark-events';
import HelpContactForm from 'me/help/help-contact-form';
import HelpContactConfirmation from 'me/help/help-contact-confirmation';
import HeaderCake from 'components/header-cake';
import wpcomLib from 'lib/wp';
import notices from 'notices';

/**
 * Module variables
 */
const noticeOptions = {
	duration: 10000,
	showDismiss: false
};

const wpcom = wpcomLib.undocumented();

module.exports = React.createClass( {
	displayName: 'HelpContact',

	componentDidMount: function() {
		olarkStore.on( 'change', this.updateOlarkState );
		olarkEvents.on( 'api.chat.onOperatorsAway', this.onOperatorsAway );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', this.onOperatorsAvailable );

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

		if ( details.isConversing && ! isOperatorAvailable ) {
			olarkActions.shrinkBox();
		}
	},

	getInitialState: function() {
		return {
			olark: olarkStore.get(),
			isSubmitting: false,
			confirmationMessage: null
		};
	},

	updateOlarkState: function() {
		this.setState( { olark: olarkStore.get() } );
	},

	backToHelp: function() {
		page( '/help' );
	},

	startChat: function( contactForm ) {
		const { message, howCanWeHelp, howYouFeel } = contactForm;

		// Intentionally not translated since only HE's will see this in the olark console as a notification.
		const notifications = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel
		];

		notifications.forEach( olarkActions.sendNotificationToOperator );

		this.sendMessageToOperator( message );
	},

	submitKayakoTicket: function( contactForm ) {
		const { subject, message, howCanWeHelp, howYouFeel } = contactForm;
		const { locale } = this.state.olark;

		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel
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
				confirmationMessage: this.translate( "We've received your message, and you'll hear back from one of our Happiness Engineers shortly." )
			} );
		} );
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

	onOperatorsAvailable: function() {
		this.showOperatorAvailabilityNotice( true );
	},

	onOperatorsAway: function() {
		this.showOperatorAvailabilityNotice( false );
	},

	showOperatorAvailabilityNotice: function( isAvailable ) {
		const { isOlarkReady, isUserEligible, details } = this.state.olark;

		// We check isOlarkReady because the operator availability events fire before the ready event to indicate if operators are available.
		// Here we only care if the availability has changed while we were viewing the contact form
		if ( ! isOlarkReady ) {
			return;
		}

		if ( ! ( isUserEligible || details.isConversing ) ) {
			// If the user is not currently chatting or the user is not eligible to chat then no need to show the notice
			return;
		}

		if ( isAvailable ) {
			notices.success( this.translate( 'Our Happiness Engineers have returned, chat with us.' ), noticeOptions );
		} else {
			notices.warning( this.translate( 'Sorry! We just missed you as our Happiness Engineers stepped away.' ), noticeOptions );
		}
	},

	getKayakoTicketForm: function() {
		const { isSubmitting, olark } = this.state;

		if ( olark.details.isConversing  ) {
			// Hide the olark widget in the bottom right corner.
			olarkActions.hideBox();
		}

		return (
			<HelpContactForm
				onSubmit={ this.submitKayakoTicket }
				buttonLabel={ isSubmitting ? this.translate( 'Submitting support ticket' ) : this.translate( 'Submit support ticket' ) }
				showHowCanWeHelpField={ true }
				showHowYouFeelField={ true }
				showSubjectField={ true }
				disabled={ isSubmitting }/>
		);
	},

	getChatForm: function() {
		return (
			<HelpContactForm
				onSubmit={ this.startChat }
				buttonLabel={ this.translate( 'Chat with us' ) }
				showHowCanWeHelpField={ true }
				showHowYouFeelField={ true }/>
		);
	},

	/**
	 * Get the view for the contact page. This could either be the olark chat widget if a chat is in progress or a contact form.
	 * @return {object} A JSX object that should be rendered
	 */
	getView: function() {
		const { olark, confirmationMessage } = this.state;

		if ( confirmationMessage ) {
			return <HelpContactConfirmation title={ this.translate( "We're on it!" ) } message={ confirmationMessage }/>;
		}

		if ( ! olark.isOlarkReady ) {
			return <div className="help-contact__placeholder" />;
		}

		if ( olark.details.isConversing && olark.isOperatorAvailable ) {
			return <OlarkChatbox />;
		}

		if ( olark.isOperatorAvailable ) {
			return this.getChatForm();
		}

		return this.getKayakoTicketForm();
	},

	render: function() {
		return (
			<Main className="help-contact">
				<HeaderCake onClick={ this.backToHelp } isCompact={ true }>{ this.translate( 'Contact Us' ) }</HeaderCake>
				<Card>
					{ this.getView() }
				</Card>
			</Main>
		);
	}
} );
