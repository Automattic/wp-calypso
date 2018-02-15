/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import Main from 'components/main';
import Card from 'components/card';
import Notice from 'components/notice';
import HelpContactForm from 'me/help/help-contact-form';
import HelpContactClosed from 'me/help/help-contact-closed';
import HelpContactConfirmation from 'me/help/help-contact-confirmation';
import HeaderCake from 'components/header-cake';
import wpcomLib from 'lib/wp';
import notices from 'notices';
import analytics from 'lib/analytics';
import getHappychatUserInfo from 'state/happychat/selectors/get-happychat-userinfo';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import hasHappychatLocalizedSupport from 'state/happychat/selectors/has-happychat-localized-support';
import {
	isTicketSupportEligible,
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'state/help/ticket/selectors';
import HappychatConnection from 'components/happychat/connection-connected';
import QueryTicketSupportConfiguration from 'components/data/query-ticket-support-configuration';
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
import { getSitePlan, isCurrentPlanPaid, isRequestingSites } from 'state/sites/selectors';
import {
	hasUserAskedADirectlyQuestion,
	isDirectlyFailed,
	isDirectlyReady,
	isDirectlyUninitialized,
} from 'state/selectors';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getHelpSelectedSiteId } from 'state/help/selectors';
import { getLanguage, isDefaultLocale } from 'lib/i18n-utils';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Module variables
 */
const defaultLanguage = getLanguage( config( 'i18n_default_locale_slug' ) ).name;
const wpcom = wpcomLib.undocumented();
let savedContactForm = null;

const SUPPORT_DIRECTLY = 'SUPPORT_DIRECTLY';
const SUPPORT_HAPPYCHAT = 'SUPPORT_HAPPYCHAT';
const SUPPORT_TICKET = 'SUPPORT_TICKET';
const SUPPORT_FORUM = 'SUPPORT_FORUM';

const startShowingChristmas2017ClosureNoticeAt = i18n.moment( 'Sun, 17 Dec 2017 00:00:00 +0000' );
const stopShowingChristmas2017ClosureNoticeAt = i18n.moment( 'Tue, 26 Dec 2017 00:00:00 +0000' );
const startShowingNewYear2018ClosureNoticeAt = i18n.moment( 'Fri, 29 Dec 2017 00:00:00 +0000' );
const stopShowingNewYear2018ClosureNoticeAt = i18n.moment( 'Tue, 2 Jan 2018 00:00:00 +0000' );

class HelpContact extends React.Component {
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

	startHappychat = contactForm => {
		this.props.openHappychat();
		const { howCanWeHelp, howYouFeel, message, site } = contactForm;

		this.props.sendUserInfo( this.props.getUserInfo( { howCanWeHelp, howYouFeel, site } ) );
		this.props.sendHappychatMessage( message, { includeInSummary: true } );

		analytics.tracks.recordEvent( 'calypso_help_live_chat_begin', {
			site_plan_product_id: site ? site.plan.product_id : null,
			is_automated_transfer: site ? site.options.is_automated_transfer : null,
		} );

		page( '/help' );
	};

	prepareDirectlyWidget = () => {
		if (
			this.hasDataToDetermineVariation() &&
			this.getSupportVariation() === SUPPORT_DIRECTLY &&
			this.props.isDirectlyUninitialized
		) {
			this.props.initializeDirectly();
		}
	};

	submitDirectlyQuestion = contactForm => {
		const { display_name, email } = this.props.currentUser;

		this.props.askDirectlyQuestion( contactForm.message, display_name, email );

		this.clearSavedContactForm();

		page( '/help' );
	};

	submitKayakoTicket = contactForm => {
		const { subject, message, howCanWeHelp, howYouFeel, site } = contactForm;
		const { currentUserLocale } = this.props;

		const ticketMeta = [
			'How can you help: ' + howCanWeHelp,
			'How I feel: ' + howYouFeel,
			'Site I need help with: ' + ( site ? site.URL : 'N/A' ),
		];

		const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );

		wpcom.submitKayakoTicket(
			subject,
			kayakoMessage,
			currentUserLocale,
			this.props.clientSlug,
			error => {
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
							"We've received your message, and you'll hear back from " +
								'one of our Happiness Engineers shortly.'
						),
					},
				} );

				analytics.tracks.recordEvent( 'calypso_help_contact_submit', {
					ticket_type: 'kayako',
					site_plan_product_id: site ? site.plan.product_id : null,
					is_automated_transfer: site ? site.options.is_automated_transfer : null,
				} );
			}
		);

		this.clearSavedContactForm();
	};

	submitSupportForumsTopic = contactForm => {
		const { subject, message } = contactForm;
		const { currentUserLocale } = this.props;

		this.setState( { isSubmitting: true } );

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

				analytics.tracks.recordEvent( 'calypso_help_contact_submit', { ticket_type: 'forum' } );
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
		return (
			this.props.isHappychatAvailable &&
			this.props.isHappychatUserEligible &&
			this.props.isSelectedHelpSiteOnPaidPlan
		);
	};

	shouldUseDirectly = () => {
		const isEn = this.props.currentUserLocale === 'en';
		return isEn && ! this.props.isDirectlyFailed;
	};

	getSupportVariation = () => {
		const { ticketSupportEligible } = this.props;

		if ( this.shouldUseHappychat() ) {
			return SUPPORT_HAPPYCHAT;
		}

		if ( ticketSupportEligible ) {
			return SUPPORT_TICKET;
		}

		if ( this.shouldUseDirectly() ) {
			return SUPPORT_DIRECTLY;
		}

		return SUPPORT_FORUM;
	};

	getContactFormPropsVariation = variationSlug => {
		const { isSubmitting } = this.state;
		const { currentUserLocale, hasMoreThanOneSite, translate } = this.props;

		switch ( variationSlug ) {
			case SUPPORT_HAPPYCHAT:
				// TEMPORARY: to collect data about the customer preferences, context 1050-happychat-gh
				// for non english customers check if we have full support in their language
				let buttonLabel = translate( 'Chat with us' );
				let additionalSupportOption = { enabled: false };

				if ( ! isDefaultLocale( currentUserLocale ) && ! this.props.hasHappychatLocalizedSupport ) {
					// make sure we only record the track once
					if ( ! this.state.wasAdditionalSupportOptionShown ) {
						// track that additional support option is shown
						this.props.recordTracksEvent( 'calypso_happychat_a_b_additional_support_option_shown', {
							locale: currentUserLocale,
						} );
						this.setState( { wasAdditionalSupportOptionShown: true } );
					}

					// override chat buttons
					buttonLabel = translate( 'Chat with us in %(defaultLanguage)s', {
						args: { defaultLanguage },
					} );

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
				};

			default:
				return {
					onSubmit: this.submitSupportForumsTopic,
					buttonLabel: isSubmitting
						? translate( 'Asking in the forums' )
						: translate( 'Ask in the forums' ),
					formDescription: translate(
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
					),
					showSubjectField: true,
					showHowCanWeHelpField: false,
					showHowYouFeelField: false,
					showSiteField: false,
				};
		}
	};

	getContactFormCommonProps = variationSlug => {
		const { isSubmitting } = this.state;
		const { currentUserLocale } = this.props;

		// Let the user know we only offer support in English.
		// We only need to show the message if:
		// 1. The user's locale doesn't match the live chat locale (usually English)
		// 2. The support request isn't sent to the forums. Because forum support
		//    requests are sent to the language specific forums (for popular languages)
		//    we don't tell the user that support is only offered in English.
		const showHelpLanguagePrompt =
			config( 'support_locales' ).indexOf( currentUserLocale ) === -1 &&
			SUPPORT_FORUM !== variationSlug;

		return {
			selectedSite: this.props.selectedSite,
			disabled: isSubmitting,
			showHelpLanguagePrompt: showHelpLanguagePrompt,
			valueLink: {
				value: savedContactForm,
				requestChange: contactForm => ( savedContactForm = contactForm ),
			},
		};
	};

	shouldShowTicketRequestErrorNotice = variationSlug => {
		const { ticketSupportRequestError } = this.props;

		return SUPPORT_HAPPYCHAT !== variationSlug && null != ticketSupportRequestError;
	};

	/**
	 * Before determining which variation to assign, certain async data needs to be in place.
	 * This function helps assess whether we're ready to say which variation the user should see.
	 *
	 * @returns {Boolean} Whether all the data is present to determine the variation to show
	 */
	hasDataToDetermineVariation = () => {
		const ticketReadyOrError =
			this.props.ticketSupportConfigurationReady || null != this.props.ticketSupportRequestError;
		const happychatReadyOrDisabled =
			! config.isEnabled( 'happychat' ) || this.props.isHappychatUserEligible !== null;

		return ticketReadyOrError && happychatReadyOrDisabled;
	};

	shouldShowPreloadForm = () => {
		const waitingOnDirectly =
			this.getSupportVariation() === SUPPORT_DIRECTLY && ! this.props.isDirectlyReady;

		return (
			this.props.isRequestingSites || ! this.hasDataToDetermineVariation() || waitingOnDirectly
		);
	};

	/**
	 * Get the view for the contact page.
	 * @return {object} A JSX object that should be rendered
	 */
	getView = () => {
		const { confirmation } = this.state;
		const { translate, selectedSitePlanSlug } = this.props;

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

		const supportVariation = this.getSupportVariation();

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
			this.getContactFormPropsVariation( supportVariation )
		);

		const currentDate = i18n.moment();

		// Customers sent to Directly and Forum are not affected by the Christmas closures
		const isUserAffectedByChristmas2017Closure =
			supportVariation !== SUPPORT_DIRECTLY && supportVariation !== SUPPORT_FORUM;

		const isClosureNoticeInEffect =
			currentDate.isBetween(
				startShowingChristmas2017ClosureNoticeAt,
				stopShowingChristmas2017ClosureNoticeAt
			) ||
			currentDate.isBetween(
				startShowingNewYear2018ClosureNoticeAt,
				stopShowingNewYear2018ClosureNoticeAt
			);

		const shouldShowClosureNotice = isUserAffectedByChristmas2017Closure && isClosureNoticeInEffect;

		return (
			<div>
				{ shouldShowClosureNotice && <HelpContactClosed sitePlanSlug={ selectedSitePlanSlug } /> }
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
		return (
			<Main className="help-contact">
				<HeaderCake onClick={ this.backToHelp } isCompact={ true }>
					{ this.props.translate( 'Contact Us' ) }
				</HeaderCake>
				{ ! this.props.isEmailVerified && <HelpUnverifiedWarning /> }
				<Card className="help-contact__form">{ this.getView() }</Card>
				{ this.props.shouldStartHappychatConnection && <HappychatConnection /> }
				<QueryTicketSupportConfiguration />
				<QueryUserPurchases userId={ this.props.currentUser.ID } />
			</Main>
		);
	}
}

export default connect(
	state => {
		const helpSelectedSiteId = getHelpSelectedSiteId( state );
		const selectedSitePlan = getSitePlan( state, helpSelectedSiteId );
		return {
			currentUserLocale: getCurrentUserLocale( state ),
			currentUser: getCurrentUser( state ),
			getUserInfo: getHappychatUserInfo( state ),
			hasHappychatLocalizedSupport: hasHappychatLocalizedSupport( state ),
			hasAskedADirectlyQuestion: hasUserAskedADirectlyQuestion( state ),
			isDirectlyFailed: isDirectlyFailed( state ),
			isDirectlyReady: isDirectlyReady( state ),
			isDirectlyUninitialized: isDirectlyUninitialized( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
			isHappychatAvailable: isHappychatAvailable( state ),
			isHappychatUserEligible: isHappychatUserEligible( state ),
			ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
			ticketSupportEligible: isTicketSupportEligible( state ),
			ticketSupportRequestError: getTicketSupportRequestError( state ),
			hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
			shouldStartHappychatConnection: ! isRequestingSites( state ) && helpSelectedSiteId,
			isRequestingSites: isRequestingSites( state ),
			isSelectedHelpSiteOnPaidPlan: isCurrentPlanPaid( state, helpSelectedSiteId ),
			selectedSitePlanSlug: selectedSitePlan && selectedSitePlan.product_slug,
		};
	},
	{
		askDirectlyQuestion,
		initializeDirectly,
		openHappychat,
		recordTracksEvent,
		sendHappychatMessage,
		sendUserInfo,
	}
)( localize( HelpContact ) );
