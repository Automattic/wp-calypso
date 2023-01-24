import config from '@automattic/calypso-config';
import { getPlanTermLabel } from '@automattic/calypso-products';
import { Card, GMClosureNotice } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import {
	shouldShowHelpCenterToUser,
	SUPPORT_CHAT_OVERFLOW,
	SUPPORT_FORUM,
	SUPPORT_HAPPYCHAT,
	SUPPORT_TICKET,
	SUPPORT_UPWORK_TICKET,
} from '@automattic/help-center';
import { isDefaultLocale, localizeUrl } from '@automattic/i18n-utils';
import { withDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import QueryTicketSupportConfiguration from 'calypso/components/data/query-ticket-support-configuration';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import withActiveSupportTickets from 'calypso/data/help/with-active-support-tickets';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import ActiveTicketsNotice from 'calypso/me/help/active-tickets-notice';
import ChatHolidayClosureNotice from 'calypso/me/help/contact-form-notice/chat-holiday-closure';
import HelpContactConfirmation from 'calypso/me/help/help-contact-confirmation';
import HelpContactForm from 'calypso/me/help/help-contact-form';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import {
	getCurrentUser,
	getCurrentUserId,
	getCurrentUserLocale,
	getCurrentUserSiteCount,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import {
	sendMessage as sendHappychatMessage,
	sendUserInfo,
} from 'calypso/state/happychat/connection/actions';
import getHappychatEnv from 'calypso/state/happychat/selectors/get-happychat-env';
import getHappychatUserInfo from 'calypso/state/happychat/selectors/get-happychat-userinfo';
import getSupportLevel from 'calypso/state/happychat/selectors/get-support-level';
import hasHappychatLocalizedSupport from 'calypso/state/happychat/selectors/has-happychat-localized-support';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import { openChat as openHappychat } from 'calypso/state/happychat/ui/actions';
import { getHelpSelectedSite } from 'calypso/state/help/selectors';
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'calypso/state/help/ticket/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import getInlineHelpSupportVariation from 'calypso/state/selectors/get-inline-help-support-variation';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import HelpUnverifiedWarning from '../help-unverified-warning';

const HELP_CENTER_STORE = HelpCenter.register();

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

	backToHelp = () => {
		const searchParams = new URLSearchParams( window.location.search );
		const redirectPath = searchParams.get( 'redirect_to' ) ?? '';
		if ( redirectPath.match( /^\/(?!\/)/ ) ) {
			page( redirectPath );
			return;
		}
		page( '/help' );
		return;
	};

	clearSavedContactForm = () => {
		savedContactForm = null;
	};

	startHappychat = ( contactForm ) => {
		const { message, site } = contactForm;
		this.recordCompactSubmit( 'happychat' );
		this.recordSubmitWithActiveTickets( 'chat' );

		if ( this.props.shouldShowHelpCenterToUser ) {
			this.props.startHelpCenterChat( site, message );
		} else {
			this.props.openHappychat();

			this.props.sendUserInfo( this.props.getUserInfo( { site } ) );
			this.props.sendHappychatMessage( message, { includeInSummary: true } );
		}

		recordTracksEvent( 'calypso_help_live_chat_begin', {
			site_plan_product_id: site ? site.plan.product_id : null,
			is_automated_transfer: site ? site.options.is_automated_transfer : null,
		} );

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

	submitSupportTicket = ( contactForm ) => {
		const { subject, message, site } = contactForm;
		const { currentUserLocale, supportVariation } = this.props;
		let plan = 'N/A';
		if ( site ) {
			plan = `${ site.plan.product_id } - ${ site.plan.product_name_short } (${ getPlanTermLabel(
				site.plan.product_slug,
				( val ) => val // Passing an identity function instead of `translate` to always return the English string
			) })`;
		}
		const ticketMeta = [ 'Site I need help with: ' + ( site ? site.URL : 'N/A' ), 'Plan: ' + plan ];

		const supportMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

		this.setState( { isSubmitting: true } );
		this.recordCompactSubmit( 'email' );

		const payload = {
			subject,
			message: supportMessage,
			locale: currentUserLocale,
			client: config( 'client_slug' ),
			is_chat_overflow: supportVariation === SUPPORT_CHAT_OVERFLOW,
			source: 'source_wpcom_fab',
		};
		if ( site ) {
			payload.blog_url = site.URL;
		}

		// Endpoint url has 'kayako', but actually submits to Zendesk.
		wpcom.req
			.post( '/help/tickets/kayako/new', payload )
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
					ticket_type: 'email',
					support_variation: supportVariation,
					site_plan_product_id: site ? site.plan.product_id : null,
					is_automated_transfer: site ? site.options.is_automated_transfer : null,
				} );

				this.recordSubmitWithActiveTickets( 'email' );
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
			should_use_test_forums:
				config( 'env_id' ) === 'wpcalypso' || config( 'env_id' ) === 'development',
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
				this.recordSubmitWithActiveTickets( 'forum' );
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
				location: 'inline-help-popover',
			} );
		}
	};

	recordSubmitWithActiveTickets( type ) {
		if ( this.props.activeSupportTicketCount > 0 ) {
			this.props.recordTracksEventAction( 'calypso_help_contact_submit_with_active_tickets', {
				support_type: type,
				active_ticket_count: this.props.activeSupportTicketCount,
			} );
		}
	}

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
						onSubmit: this.submitSupportTicket,
						showChatStagingNotice: this.props.happychatEnv === 'staging',
					};
				}

				return {
					additionalSupportOption,
					onSubmit: this.startHappychat,
					buttonLabel,
					showSubjectField: false,
					showSiteField: hasMoreThanOneSite,
					showQASuggestions: true,
					showChatStagingNotice: this.props.happychatEnv === 'staging',
				};
			}
			case SUPPORT_CHAT_OVERFLOW:
			case SUPPORT_TICKET:
			case SUPPORT_UPWORK_TICKET:
				return {
					onSubmit: this.submitSupportTicket,
					buttonLabel: isSubmitting ? translate( 'Sending email' ) : translate( 'Email us' ),
					showSubjectField: true,
					showSiteField: hasMoreThanOneSite,
					showQASuggestions: true,
					// still show notice for email support to explain why chat is unavailable
					showChatStagingNotice: this.props.happychatEnv === 'staging',
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

		return ticketReadyOrError && happychatReadyOrDisabled;
	};

	shouldShowPreloadForm = () => {
		return this.props.isRequestingSites || ! this.hasDataToDetermineVariation();
	};

	// Modifies passed props for the "compact" contact form style.
	contactFormPropsCompactFilter = ( props ) => {
		if ( this.props.compact ) {
			return Object.assign( props, {
				showSubjectField: false,
				showQASuggestions: false,
			} );
		}
		return props;
	};

	/**
	 * Get the view for the contact page.
	 *
	 * @returns {Object} A JSX object that should be rendered
	 */
	getView = () => {
		const { confirmation } = this.state;
		const { activeSupportTicketCount, compact, supportVariation, translate } = this.props;

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

		const contactFormProps = Object.assign(
			this.getContactFormCommonProps( supportVariation ),
			this.contactFormPropsCompactFilter( this.getContactFormPropsVariation( supportVariation ) )
		);

		// Customers sent to Forums, and Upwork are not affected by live chat closures
		const isUserAffectedByLiveChatClosure =
			[ SUPPORT_FORUM, SUPPORT_UPWORK_TICKET ].indexOf( supportVariation ) === -1;

		const hasAccessToLivechat = ! [ 'free', 'personal', 'starter' ].includes(
			this.props.supportLevel
		);

		return (
			<div>
				{ activeSupportTicketCount > 0 && (
					<ActiveTicketsNotice count={ activeSupportTicketCount } compact={ compact } />
				) }

				{ isUserAffectedByLiveChatClosure && (
					<>
						<ChatHolidayClosureNotice
							holidayName={ translate( 'Easter', {
								context: 'Holiday name',
							} ) }
							compact={ compact }
							displayAt="2022-04-10 00:00Z"
							closesAt="2022-04-17 00:00Z"
							reopensAt="2022-04-18 07:00Z"
						/>
						<GMClosureNotice
							displayAt="2022-10-29 00:00Z"
							closesAt="2022-11-05 00:00Z"
							reopensAt="2022-11-14 07:00Z"
							enabled={ hasAccessToLivechat }
						/>
						<ChatHolidayClosureNotice
							holidayName={ translate( 'Christmas', {
								context: 'Holiday name',
							} ) }
							compact={ compact }
							displayAt="2022-12-17 00:00Z"
							closesAt="2022-12-24 00:00Z"
							reopensAt="2022-12-26 07:00Z"
						/>
						<ChatHolidayClosureNotice
							holidayName={ translate( "New Year's Day", {
								context: 'Holiday name',
							} ) }
							compact={ compact }
							displayAt="2022-12-26 07:00Z"
							closesAt="2022-12-31 00:00Z"
							reopensAt="2023-01-02 07:00Z"
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
				{ this.props.shouldStartHappychatConnection && <HappychatConnection isHappychatEnabled /> }
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

export default withDispatch( ( dispatch ) => {
	return { startHelpCenterChat: dispatch( HELP_CENTER_STORE ).startHelpCenterChat };
} )(
	connect(
		( state ) => {
			const selectedSite = getHelpSelectedSite( state );
			const isChatEligible = isHappychatUserEligible( state );
			return {
				selectedSite,
				currentUserLocale: getCurrentUserLocale( state ),
				currentUser: getCurrentUser( state ),
				getUserInfo: getHappychatUserInfo( state ),
				hasHappychatLocalizedSupport: hasHappychatLocalizedSupport( state ),
				isEmailVerified: isCurrentUserEmailVerified( state ),
				isHappychatUserEligible: isChatEligible,
				localizedLanguageNames: getLocalizedLanguageNames( state ),
				ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
				ticketSupportRequestError: getTicketSupportRequestError( state ),
				hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
				shouldStartHappychatConnection: ! isRequestingSites( state ) && isChatEligible,
				isRequestingSites: isRequestingSites( state ),
				supportLevel: getSupportLevel( state ),
				supportVariation: getInlineHelpSupportVariation( state ),
				shouldShowHelpCenterToUser: shouldShowHelpCenterToUser( getCurrentUserId( state ) ),
				happychatEnv: getHappychatEnv( state ),
			};
		},
		{
			errorNotice,
			openHappychat,
			recordTracksEventAction,
			sendHappychatMessage,
			sendUserInfo,
		}
	)( localize( withActiveSupportTickets( HelpContact ) ) )
);
