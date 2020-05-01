/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import Main from 'components/main';
import { Card } from '@automattic/components';
import Notice from 'components/notice';
import HelpContactForm from 'me/help/help-contact-form';
import ActiveTicketsNotice from 'me/help/active-tickets-notice';
import LimitedChatAvailabilityNotice from 'me/help/contact-form-notice/limited-chat-availability';
import HelpContactConfirmation from 'me/help/help-contact-confirmation';
import HeaderCake from 'components/header-cake';
import wpcomLib from 'lib/wp';
import notices from 'notices';
import { recordTracksEvent } from 'lib/analytics/tracks';
import getHappychatUserInfo from 'state/happychat/selectors/get-happychat-userinfo';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import hasHappychatLocalizedSupport from 'state/happychat/selectors/has-happychat-localized-support';
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'state/help/ticket/selectors';
import HappychatConnection from 'components/happychat/connection-connected';
import QueryTicketSupportConfiguration from 'components/data/query-ticket-support-configuration';
import QuerySupportHistory from 'components/data/query-support-history';
import HelpUnverifiedWarning from '../help-unverified-warning';
import {
	sendMessage as sendHappychatMessage,
	sendUserInfo,
} from 'state/happychat/connection/actions';
import { openChat as openHappychat } from 'state/happychat/ui/actions';
import {
	getCurrentUser,
	getCurrentUserLocale,
	getCurrentUserSiteCount,
	isCurrentUserEmailVerified,
} from 'state/current-user/selectors';
import {
	askQuestion as askDirectlyQuestion,
	initialize as initializeDirectly,
} from 'state/help/directly/actions';
import { isRequestingSites } from 'state/sites/selectors';
import getLocalizedLanguageNames from 'state/selectors/get-localized-language-names';
import hasUserAskedADirectlyQuestion from 'state/selectors/has-user-asked-a-directly-question';
import isDirectlyReady from 'state/selectors/is-directly-ready';
import isDirectlyUninitialized from 'state/selectors/is-directly-uninitialized';
import getActiveSupportTickets from 'state/selectors/get-active-support-tickets';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getHelpSelectedSiteId } from 'state/help/selectors';
import { isDefaultLocale, localizeUrl } from 'lib/i18n-utils';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryLanguageNames from 'components/data/query-language-names';
import getInlineHelpSupportVariation, {
	SUPPORT_DIRECTLY,
	SUPPORT_HAPPYCHAT,
	SUPPORT_TICKET,
	SUPPORT_FORUM,
} from 'state/selectors/get-inline-help-support-variation';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:help-contact' );

/**
 * Module variables
 */
const defaultLanguageSlug = config( 'i18n_default_locale_slug' );
const wpcom = wpcomLib.undocumented();
let savedContactForm = null;

class HelpContact extends React.Component {
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
		if (
			this.hasDataToDetermineVariation() &&
			this.props.supportVariation === SUPPORT_DIRECTLY &&
			this.props.isDirectlyUninitialized
		) {
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
		const { currentUserLocale } = this.props;

		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' ),
		];

		const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );
		this.recordCompactSubmit( 'kayako' );

		wpcom.submitKayakoTicket(
			subject,
			kayakoMessage,
			currentUserLocale,
			this.props.clientSlug,
			( error ) => {
				if ( error ) {
					// TODO: bump a stat here
					notices.error( error.message );

					this.setState( { isSubmitting: false } );
					return;
				}

				this.setState( {
					isSubmitting: false,
					confirmation: {
						title: this.props.translate( "We're on it!" ),
						message: this.props.translate(
							'We normally reply within 24-48 hours but are experiencing longer delays ' +
								'right now. We appreciate your patience and will respond as soon as we can.'
						),
					},
				} );

				recordTracksEvent( 'calypso_help_contact_submit', {
					ticket_type: 'kayako',
					site_plan_product_id: site ? site.plan.product_id : null,
					is_automated_transfer: site ? site.options.is_automated_transfer : null,
				} );

				if ( this.props.activeSupportTickets.length > 0 ) {
					recordTracksEvent( 'calypso_help_contact_submit_with_active_tickets', {
						support_type: 'email',
						active_ticket_count: this.props.activeSupportTickets.length,
					} );
				}
			}
		);

		this.clearSavedContactForm();
	};

	submitSupportForumsTopic = ( contactForm ) => {
		const { subject, message } = contactForm;
		const { currentUserLocale } = this.props;

		this.setState( { isSubmitting: true } );
		this.recordCompactSubmit( 'forums' );

		wpcom.submitSupportForumsTopic(
			subject,
			message,
			currentUserLocale,
			this.props.clientSlug,
			( error, data ) => {
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
			}
		);

		this.clearSavedContactForm();
	};

	shouldUseHappychat = () => {
		// if happychat is disabled in the config, do not use it
		if ( ! config.isEnabled( 'happychat' ) ) {
			return false;
		}

		// if the happychat connection is able to accept chats, use it
		return this.props.isHappychatAvailable && this.props.isHappychatUserEligible;
	};

	shouldUseDirectly = () => {
		const isEn = this.props.currentUserLocale === 'en';
		return isEn && ! this.props.isDirectlyFailed;
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
			case SUPPORT_TICKET:
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
					showSiteField: false,
					showQASuggestions: true,
				};
		}
	};

	getContactFormCommonProps = ( variationSlug ) => {
		const { isSubmitting } = this.state;
		const { currentUserLocale } = this.props;

		// Let the user know we only offer support in English.
		// We only need to show the message if:
		// 1. The user's locale doesn't match the live chat locale (usually English)
		// 2. The support request isn't sent to the forums. Because forum support
		//    requests are sent to the language specific forums (for popular languages)
		//    we don't tell the user that support is only offered in English.
		const showHelpLanguagePrompt =
			config( 'livechat_support_locales' ).indexOf( currentUserLocale ) === -1 &&
			SUPPORT_FORUM !== variationSlug;

		return {
			compact: this.props.compact,
			selectedSite: this.props.selectedSite,
			disabled: isSubmitting,
			showHelpLanguagePrompt,
			valueLink: {
				value: savedContactForm,
				requestChange: ( contactForm ) => ( savedContactForm = contactForm ),
			},
		};
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

		return ticketReadyOrError && happychatReadyOrDisabled;
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

		// Customers sent to Directly and Forum are not affected by live chat closures
		const isUserAffectedByLiveChatClosure =
			supportVariation !== SUPPORT_DIRECTLY && supportVariation !== SUPPORT_FORUM;

		const activeTicketCount = activeSupportTickets.length;

		return (
			<div>
				{ activeTicketCount > 0 && (
					<ActiveTicketsNotice count={ activeTicketCount } compact={ compact } />
				) }

				{ isUserAffectedByLiveChatClosure && (
					<>
						<LimitedChatAvailabilityNotice
							compact={ compact }
							showAt="2020-03-27 00:00Z"
							hideAt="2050-01-01 00:00Z"
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
				<QueryUserPurchases userId={ this.props.currentUser.ID } />
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
		const helpSelectedSiteId = getHelpSelectedSiteId( state );
		return {
			currentUserLocale: getCurrentUserLocale( state ),
			currentUser: getCurrentUser( state ),
			getUserInfo: getHappychatUserInfo( state ),
			hasHappychatLocalizedSupport: hasHappychatLocalizedSupport( state ),
			hasAskedADirectlyQuestion: hasUserAskedADirectlyQuestion( state ),
			isDirectlyReady: isDirectlyReady( state ),
			isDirectlyUninitialized: isDirectlyUninitialized( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
			isHappychatUserEligible: isHappychatUserEligible( state ),
			localizedLanguageNames: getLocalizedLanguageNames( state ),
			ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
			ticketSupportRequestError: getTicketSupportRequestError( state ),
			hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
			shouldStartHappychatConnection: ! isRequestingSites( state ) && helpSelectedSiteId,
			isRequestingSites: isRequestingSites( state ),
			supportVariation: getInlineHelpSupportVariation( state ),
			activeSupportTickets: getActiveSupportTickets( state ),
		};
	},
	{
		askDirectlyQuestion,
		initializeDirectly,
		openHappychat,
		recordTracksEventAction,
		sendHappychatMessage,
		sendUserInfo,
	}
)( localize( HelpContact ) );
