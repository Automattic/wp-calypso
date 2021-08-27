import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { debounce, isEqual, find, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import InlineHelpCompactResults from 'calypso/blocks/inline-help/inline-help-compact-results';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import Gridicon from 'calypso/components/gridicon';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SegmentedControl from 'calypso/components/segmented-control';
import SelectDropdown from 'calypso/components/select-dropdown';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { resemblesUrl } from 'calypso/lib/url';
import wpcomLib from 'calypso/lib/wp';
import HelpResults from 'calypso/me/help/help-results';
import {
	bumpStat,
	recordTracksEvent as recordTracksEventAction,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import {
	getCurrentUserLocale,
	getCurrentUserSiteCount,
} from 'calypso/state/current-user/selectors';
import { selectSiteId } from 'calypso/state/help/actions';
import { getHelpSelectedSite, getHelpSelectedSiteId } from 'calypso/state/help/selectors';
import { showQandAOnInlineHelpContactForm } from 'calypso/state/inline-help/actions';
import isShowingQandAInlineHelpContactForm from 'calypso/state/selectors/is-showing-q-and-a-inline-help-contact-form';
import { requestSite } from 'calypso/state/sites/actions';
import { generateSubjectFromMessage } from './utils';

import './style.scss';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();

const trackSibylClick = ( event, helpLink ) =>
	composeAnalytics(
		bumpStat( 'sibyl_question_clicks', helpLink.id ),
		recordTracksEventAction( 'calypso_sibyl_question_click', {
			question_id: helpLink.id,
		} )
	);

const trackSibylFirstClick = ( event, helpLink ) =>
	composeAnalytics(
		recordTracksEventAction( 'calypso_sibyl_first_question_click', {
			question_id: helpLink.id,
		} )
	);

const trackSupportAfterSibylClick = () =>
	composeAnalytics( recordTracksEventAction( 'calypso_sibyl_support_after_question_click' ) );

const trackSupportWithSibylSuggestions = ( query, suggestions ) =>
	composeAnalytics(
		recordTracksEventAction( 'calypso_sibyl_support_with_suggestions_showing', {
			query,
			suggestions,
		} )
	);

const trackSupportWithoutSibylSuggestions = ( query ) =>
	composeAnalytics(
		recordTracksEventAction( 'calypso_sibyl_support_without_suggestions_showing', { query } )
	);

export class HelpContactForm extends React.PureComponent {
	static propTypes = {
		additionalSupportOption: PropTypes.object,
		formDescription: PropTypes.node,
		buttonLabel: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		showAlternativeSiteOptionsField: PropTypes.bool,
		showHowCanWeHelpField: PropTypes.bool,
		showHowYouFeelField: PropTypes.bool,
		showSubjectField: PropTypes.bool,
		showSiteField: PropTypes.bool,
		showHelpLanguagePrompt: PropTypes.bool,
		showHidingUrlOption: PropTypes.bool,
		helpSite: PropTypes.object,
		helpSiteId: PropTypes.number,
		siteFilter: PropTypes.func,
		siteList: PropTypes.object,
		disabled: PropTypes.bool,
		valueLink: PropTypes.shape( {
			value: PropTypes.any,
			requestChange: PropTypes.func.isRequired,
		} ),
	};

	static defaultProps = {
		formDescription: '',
		showAlternativeSiteOptionsField: false,
		showHowCanWeHelpField: false,
		showHowYouFeelField: false,
		showSubjectField: false,
		showSiteField: false,
		showHelpLanguagePrompt: false,
		showHidingUrlOption: false,
		disabled: false,
		valueLink: {
			value: null,
			requestChange: () => {},
		},
		showingQandAStep: false,
		showQandAOnInlineHelpContactForm: () => {},
	};

	/**
	 * Set up our initial state
	 *
	 * @returns {object} An object representing our initial state
	 */
	state = this.props.valueLink.value || {
		howCanWeHelp: 'gettingStarted',
		howYouFeel: 'unspecified',
		message: '',
		subject: '',
		sibylClicked: false,
		userDeclaresNoSite: false,
		userDeclaresUnableToSeeSite: this.props.siteCount === 0,
		userDeclaredUrl: '',
		userRequestsHidingUrl: false,
		qanda: [],
	};

	componentDidMount() {
		this.debouncedQandA = debounce( this.doQandASearch, 500 );
		this.requestSite = debounce( this.doRequestSite, 500 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.valueLink.value || isEqual( nextProps.valueLink.value, this.state ) ) {
			return;
		}

		this.setState( nextProps.valueLink.value );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.subject !== this.state.subject || prevState.message !== this.state.message ) {
			this.debouncedQandA();
		}

		if ( prevState.userDeclaredUrl !== this.state.userDeclaredUrl ) {
			this.requestSite();
		}
		this.props.valueLink.requestChange( this.state );
	}

	trackClickStats = ( selectionName, selectedOption ) => {
		const tracksEvent = {
			howCanWeHelp: 'calypso_help_how_can_we_help_click',
			howYouFeel: 'calypso_help_how_you_feel_click',
		}[ selectionName ];

		if ( tracksEvent ) {
			recordTracksEvent( tracksEvent, { selected_option: selectedOption } );
		}
	};

	getSibylQuery = () => ( this.state.subject + ' ' + this.state.message ).trim();

	doRequestSite = () => {
		if ( resemblesUrl( this.state.userDeclaredUrl ) ) {
			// The API would reject something like "https://wp.com/slug".
			// It'd need to either be "http(s)://wp.com" or "wp.com".
			const url = this.state.userDeclaredUrl;
			const query = url.includes( '://' )
				? new URL( this.state.userDeclaredUrl ).hostname
				: new URL( 'http://' + this.state.userDeclaredUrl ).hostname;

			const request = ( q ) =>
				this.props
					.requestSite( q )
					.then( ( siteData ) =>
						this.setState( { siteData, errorData: null, hasRetriedRequest: false } )
					)
					.catch( ( error ) => {
						if ( url.includes( 'www.' ) && ! this.state.hasRetriedRequest ) {
							this.setState( { hasRetriedRequest: true } );
							return request( q.replace( 'www.', '' ) );
						}
						this.setState( { errorData: error.error, siteData: null, hasRetriedRequest: false } );
					} );

			return request( query );
		}
	};

	doQandASearch = () => {
		const query = this.getSibylQuery();

		if ( '' === query ) {
			this.setState( { qanda: [] } );
			return;
		}

		const areSameQuestions = ( existingQuestions, newQuestions ) => {
			const existingIDs = existingQuestions.map( ( question ) => question.id );
			existingIDs.sort();
			const newIDs = newQuestions.map( ( question ) => question.id );
			newIDs.sort();
			return existingIDs.toString() === newIDs.toString();
		};
		const site = this.props.helpSite.jetpack
			? config( 'jetpack_support_blog' )
			: config( 'wpcom_support_blog' );

		wpcom
			.getQandA( query, site )
			.then( ( qanda ) =>
				this.setState( {
					qanda: Array.isArray( qanda ) ? qanda : [],
					// only keep sibylClicked true if the user is seeing the same set of questions
					// we don't want to track "questions -> question click -> different questions -> support click",
					// so we need to set sibylClicked to false here if the questions have changed
					sibylClicked: this.state.sibylClicked && areSameQuestions( this.state.qanda, qanda ),
				} )
			)
			.catch( () => this.setState( { qanda: [], sibylClicked: false } ) );
	};

	trackSibylClick = ( event, helpLink ) => {
		if ( ! this.state.sibylClicked ) {
			this.props.trackSibylFirstClick( event, helpLink );
		}
		this.props.trackSibylClick( event, helpLink );
		this.setState( { sibylClicked: true } );
	};

	/**
	 * Render both a SegmentedControl and SelectDropdown component.
	 *
	 * The SegmentedControl is used for desktop and the SelectDropdown is used for mobile.
	 * CSS will control which one is displayed to the user.
	 *
	 * @param  {string} selectionName    The name that will be used to store the value of a selected option appearing in selectionOptions.
	 * @param  {object} selectionOptions An array of objects consisting of a value and a label. It can also have a property called subtext
	 *                                   value is used when setting state, label is used for display in the selection component, and subtext
	 *                                   is used for the second line of text displayed in the SegmentedControl
	 * @returns {object}                  A JSX object containing both the SegmentedControl and the SelectDropdown.
	 */
	renderFormSelection = ( selectionName, selectionOptions ) => {
		const { translate } = this.props;
		const options = selectionOptions.map( ( option ) => ( {
			label: option.label,
			subtext: option.subtext ? (
				<span className="help-contact-form__selection-subtext">{ option.subtext }</span>
			) : null,
			props: {
				key: option.value,
				selected: option.value === this.state[ selectionName ],
				value: option.value,
				title: option.label,
				onClick: () => {
					this.setState( { [ selectionName ]: option.value } );
					this.trackClickStats( selectionName, option.value );
				},
			},
		} ) );
		const selectedItem = find( options, 'props.selected' );

		return (
			<div className="help-contact-form__selection">
				<SegmentedControl primary>
					{ options.map( ( option ) => (
						<SegmentedControl.Item { ...option.props }>
							{ option.label }
							{ option.subtext }
						</SegmentedControl.Item>
					) ) }
				</SegmentedControl>
				<SelectDropdown
					selectedText={ selectedItem ? selectedItem.label : translate( 'Select an option' ) }
				>
					{ options.map( ( option ) => (
						<SelectDropdown.Item { ...option.props }>{ option.label }</SelectDropdown.Item>
					) ) }
				</SelectDropdown>
			</div>
		);
	};

	/**
	 * For the forums: check if we're dealing with a WP.com site.
	 */
	analyseSiteData = () => {
		const { userDeclaredUrl, userDeclaresUnableToSeeSite, errorData, siteData } = this.state;
		const { helpSite } = this.props;

		// "Unauthorized" means it's still a WP.com site - just a private one.
		const isWpComConnectedSite =
			( userDeclaredUrl &&
				siteData &&
				siteData.ID &&
				( ! siteData.jetpack || siteData.is_wpcom_atomic ) ) ||
			( helpSite &&
				! userDeclaresUnableToSeeSite &&
				helpSite &&
				helpSite.ID &&
				( ! helpSite.jetpack || helpSite.is_wpcom_atomic ) ) ||
			( userDeclaredUrl && errorData && errorData === 'unauthorized' );

		// Returns true for self-hosted sites, irrespective of Jetpack connection status, and non-WordPress sites.
		const isNonWpComHostedSite =
			( userDeclaredUrl && siteData && siteData.jetpack ) ||
			( userDeclaredUrl &&
				errorData &&
				( errorData === 'unknown_blog' || errorData === 'jetpack_error' ) ) ||
			( helpSite && helpSite.jetpack && ! userDeclaresUnableToSeeSite );

		if ( isWpComConnectedSite ) {
			return userDeclaredUrl
				? 'isWpComConnectedSiteNotLinkedToAccount'
				: 'isWpComConnectedSiteLinkedToAccount';
		}

		if ( isNonWpComHostedSite ) {
			// If the site is considered unknown, Jetpack isn't installed on it.
			// Note: it's possible that the site isn't even a WordPress one if that happens.
			return userDeclaredUrl && errorData === 'unknown_blog'
				? 'isNonWpComHostedSiteWithoutJetpack'
				: 'isNonWpComHostedSiteWithJetpack';
		}

		return null;
	};

	/**
	 * Determine if this form is ready to submit
	 *
	 * @returns {boolean}	Return true if this form can be submitted
	 */
	canSubmitForm = () => {
		const { disabled, showSubjectField } = this.props;
		const { subject, message } = this.state;

		if ( disabled ) {
			return false;
		}

		if ( showSubjectField && ! subject.trim() ) {
			return false;
		}

		return !! message.trim();
	};

	/**
	 * Start a chat using the info set in state
	 */
	submitForm = () => {
		const {
			howCanWeHelp,
			howYouFeel,
			message,
			siteCount,
			userDeclaresUnableToSeeSite,
			userDeclaredUrl,
			userDeclaresNoSite,
			userRequestsHidingUrl,
		} = this.state;
		const { additionalSupportOption, currentUserLocale, compact } = this.props;
		const subject = compact ? generateSubjectFromMessage( message ) : this.state.subject;

		if ( additionalSupportOption && additionalSupportOption.enabled ) {
			this.props.recordTracksEventAction( 'calypso_happychat_a_b_english_chat_selected', {
				locale: currentUserLocale,
			} );
		}

		if ( this.state.sibylClicked ) {
			// track that the user had clicked a Sibyl result, but still contacted support
			this.props.trackSupportAfterSibylClick();
			this.setState( { sibylClicked: false } );
		}

		if ( isEmpty( this.state.qanda ) ) {
			this.props.trackSupportWithoutSibylSuggestions( this.getSibylQuery() );
		} else {
			this.props.trackSupportWithSibylSuggestions(
				this.getSibylQuery(),
				this.state.qanda.map( ( { id, title } ) => `${ id } - ${ title }` ).join( ' / ' )
			);
		}

		const analyseSiteData = this.analyseSiteData();

		this.props.onSubmit( {
			howCanWeHelp,
			howYouFeel,
			message,
			subject,
			site: this.props.helpSite,
			helpSiteIsJetpack: analyseSiteData === 'isNonWpComHostedSiteWithJetpack',
			helpSiteIsNotWpCom: analyseSiteData && analyseSiteData.startsWith( 'isNonWpComHosted' ),
			helpSiteIsWpCom: analyseSiteData && analyseSiteData.startsWith( 'isWpComConnectedSite' ),
			userDeclaredUrl: userDeclaresUnableToSeeSite && userDeclaredUrl,
			userDeclaresNoSite,
			userRequestsHidingUrl,
		} );

		this.setState( {
			message: '',
			subject: '',
			userDeclaresNoSite: false,
			userDeclaresUnableToSeeSite: siteCount === 0,
			userDeclaredUrl: '',
			userRequestsHidingUrl: false,
		} );
	};

	/**
	 * Submit additional support option
	 */
	submitAdditionalForm = () => {
		const { howCanWeHelp, howYouFeel, message } = this.state;
		const { currentUserLocale } = this.props;
		const subject = generateSubjectFromMessage( message );

		this.props.recordTracksEventAction( 'calypso_happychat_a_b_native_ticket_selected', {
			locale: currentUserLocale,
		} );

		this.props.additionalSupportOption.onSubmit( {
			howCanWeHelp,
			howYouFeel,
			message,
			subject,
			site: this.props.helpSite,
		} );
	};

	/**
	 * Render the contact form
	 *
	 * @returns {object} ReactJS JSX object
	 */
	render() {
		const {
			additionalSupportOption,
			formDescription,
			buttonLabel,
			siteCount,
			showAlternativeSiteOptionsField,
			showHowCanWeHelpField,
			showHowYouFeelField,
			showSubjectField,
			showSiteField,
			showQASuggestions,
			showHelpLanguagePrompt,
			showHidingUrlOption,
			translate,
			showingQandAStep,
		} = this.props;
		const hasQASuggestions = ! isEmpty( this.state.qanda );

		const howCanWeHelpOptions = [
			{
				value: 'gettingStarted',
				label: translate( 'Get started' ),
				subtext: translate( 'Can you show me how to…' ),
			},
			{
				value: 'somethingBroken',
				label: translate( "Report something isn't working" ),
				subtext: translate( 'Can you check this out…' ),
			},
			{
				value: 'suggestion',
				label: translate( 'Make a suggestion' ),
				subtext: translate( 'I think it would be cool if…' ),
			},
		];
		const howYouFeelOptions = [
			{ value: 'unspecified', label: translate( "I'd rather not" ) },
			{ value: 'happy', label: translate( 'Happy' ) },
			{ value: 'confused', label: translate( 'Confused' ) },
			{ value: 'discouraged', label: translate( 'Discouraged' ) },
			{ value: 'upset', label: translate( 'Upset' ) },
			{ value: 'panicked', label: translate( 'Panicked' ) },
		];

		const analyseSiteData = this.analyseSiteData();
		const siteData = this.state.userDeclaredUrl && this.state.siteData;
		const siteName =
			siteData && siteData.name
				? siteData.name
				: translate( 'This site', {
						comment: 'Full phrase: "This site is linked to another WordPress.com account"',
				  } );

		const hasNoSites = siteCount === 0;

		let noticeMessage;
		let actionLink;
		let actionMessage;

		if ( analyseSiteData === 'isWpComConnectedSiteNotLinkedToAccount' ) {
			// The site is linked to WordPress.com but not appearing for the user, so they've probably lost access to the account which owns it.
			noticeMessage = translate(
				"%(siteName)s is linked to another WordPress.com account. If you're trying to access it, please follow our Account Recovery procedure.",
				{
					args: {
						siteName,
					},
				}
			);
			actionLink = localizeUrl( 'https://wordpress.com/wp-login.php?action=recovery' );
			actionMessage = translate( 'Learn more' );
		}

		if (
			analyseSiteData &&
			analyseSiteData.startsWith( 'isNonWpComHosted' ) &&
			this.state.errorData !== 'jetpack_error'
		) {
			noticeMessage = translate(
				'%(siteName)s may be a copy of WordPress with a different hosting service. ' +
					"{{helpLink}}Here's the best way to find help with that{{/helpLink}}. " +
					"If you're not sure though, please share your question with a link, and we'll point you in the right direction!",
				{
					components: {
						helpLink: (
							<a
								href={ localizeUrl(
									'https://wordpress.com/support/help-support-options/#where-should-i-go-for-support'
								) }
							/>
						),
					},
					args: {
						siteName,
					},
				}
			);
		}

		if ( showingQandAStep && hasQASuggestions ) {
			return (
				<div className="help-contact-form">
					<h2 className="help-contact-form__title">
						{ preventWidows( translate( 'Did you want the answer to any of these questions?' ) ) }
					</h2>
					<InlineHelpCompactResults
						helpLinks={ this.state.qanda }
						onClick={ this.trackSibylClick }
					/>
					<FormButton disabled={ ! this.canSubmitForm() } type="button" onClick={ this.submitForm }>
						{ buttonLabel }
						<Gridicon icon="chevron-right" />
					</FormButton>
				</div>
			);
		}

		return (
			<div className="help-contact-form">
				{ formDescription && <p>{ formDescription }</p> }

				{ showHowCanWeHelpField && (
					<div>
						<FormLabel>{ translate( "You're reaching out to…" ) }</FormLabel>
						{ this.renderFormSelection( 'howCanWeHelp', howCanWeHelpOptions ) }
					</div>
				) }

				{ showHowYouFeelField && (
					<div>
						<FormLabel>{ translate( 'Mind sharing how you feel?' ) }</FormLabel>
						{ this.renderFormSelection( 'howYouFeel', howYouFeelOptions ) }
					</div>
				) }

				{ showSiteField && (
					<div className="help-contact-form__site-selection">
						{ ! hasNoSites && (
							<>
								<FormLabel>
									{ siteCount === 1
										? translate( 'Is this the site which you need help with?' )
										: translate( 'Which site do you need help with?' ) }
								</FormLabel>
								<SitesDropdown
									selectedSiteId={ this.props.helpSiteId }
									onSiteSelect={ this.props.onChangeSite }
								/>
							</>
						) }
						{ showAlternativeSiteOptionsField && (
							<div className="help-contact-form__site-alternatives">
								{ ! hasNoSites && (
									<FormLabel>
										<FormCheckbox
											onChange={ () => {
												this.setState( {
													userDeclaresUnableToSeeSite: ! this.state.userDeclaresUnableToSeeSite,
													userDeclaredUrl: '',
												} );
											} }
											disabled={ this.state.userDeclaresNoSite }
										/>
										<span>{ translate( 'I need help with a different site' ) }</span>
									</FormLabel>
								) }

								{ hasNoSites && (
									<FormLabel>
										<FormCheckbox
											onChange={ () => {
												this.setState( { userDeclaresNoSite: ! this.state.userDeclaresNoSite } );
											} }
										/>
										<span>{ translate( "I don't have a site with WordPress.com yet" ) }</span>
									</FormLabel>
								) }

								{ this.state.userDeclaresUnableToSeeSite && ! this.state.userDeclaresNoSite && (
									<div className="help-contact-form__site-alternatives-url">
										<FormLabel htmlFor="userDeclaredUrl">
											{ translate( 'What is the URL of the site you need help with?' ) }
										</FormLabel>
										<FormTextInput
											id="userDeclaredUrl"
											name="userDeclaredUrl"
											value={ this.state.userDeclaredUrl }
											onChange={ this.handleChange }
											placeholder="https://"
										/>
									</div>
								) }

								{ noticeMessage && (
									<Notice
										className="help-contact-form__site-notice"
										status="is-warning"
										showDismiss={ false }
										text={ noticeMessage }
									>
										{ actionMessage && (
											<NoticeAction href={ actionLink } external>
												{ actionMessage }
											</NoticeAction>
										) }
									</Notice>
								) }
							</div>
						) }
					</div>
				) }

				{ showSubjectField && (
					<div className="help-contact-form__subject">
						<FormLabel htmlFor="subject">{ translate( 'Subject' ) }</FormLabel>
						<FormTextInput
							id="subject"
							name="subject"
							value={ this.state.subject }
							onChange={ this.handleChange }
						/>
					</div>
				) }

				<FormLabel htmlFor="message">{ translate( 'How can we help?' ) }</FormLabel>
				<FormTextarea
					placeholder={ translate( 'Ask away! Help will be with you soon.' ) }
					id="message"
					name="message"
					value={ this.state.message }
					onChange={ this.handleChange }
				/>

				{ ! this.state.userDeclaresNoSite && showHidingUrlOption && (
					<FormLabel>
						<FormCheckbox
							onChange={ () => {
								this.setState( {
									userRequestsHidingUrl: ! this.state.userRequestsHidingUrl,
								} );
							} }
						/>
						<span>{ translate( "Don't display my site's URL publicly" ) }</span>
						<p className="help-contact-form__public-url-checkbox-text">
							{ translate(
								"This may result in a longer response time, but WordPress.com staff in the forums will still be able to view your site's URL."
							) }
						</p>
					</FormLabel>
				) }

				{ showHelpLanguagePrompt && (
					<strong className="help-contact-form__help-language-prompt">
						{ translate( 'Note: Support is only available in English at the moment.' ) }
					</strong>
				) }

				{ showQASuggestions && (
					<HelpResults
						header={ translate( 'Do you want the answer to any of these questions?' ) }
						helpLinks={ this.state.qanda }
						iconTypeDescription="book"
						onClick={ this.trackSibylClick }
						compact
					/>
				) }

				{ ! showQASuggestions && hasQASuggestions && (
					<FormButton type="button" onClick={ this.props.showQandAOnInlineHelpContactForm }>
						{ translate( 'Continue' ) }
					</FormButton>
				) }

				{ ( showQASuggestions || ! hasQASuggestions ) && (
					<FormButton disabled={ ! this.canSubmitForm() } type="button" onClick={ this.submitForm }>
						{ buttonLabel }
					</FormButton>
				) }

				{ additionalSupportOption && additionalSupportOption.enabled && (
					<FormButton
						disabled={ ! this.canSubmitForm() }
						type="button"
						onClick={ this.submitAdditionalForm }
					>
						{ additionalSupportOption.label }
					</FormButton>
				) }
			</div>
		);
	}

	handleChange = ( e ) => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

const mapStateToProps = ( state ) => ( {
	currentUserLocale: getCurrentUserLocale( state ),
	siteCount: getCurrentUserSiteCount( state ),
	helpSite: getHelpSelectedSite( state ),
	helpSiteId: getHelpSelectedSiteId( state ),
	showingQandAStep: isShowingQandAInlineHelpContactForm( state ),
} );

const mapDispatchToProps = {
	onChangeSite: selectSiteId,
	recordTracksEventAction,
	requestSite,
	trackSibylClick,
	trackSibylFirstClick,
	trackSupportAfterSibylClick,
	trackSupportWithSibylSuggestions,
	trackSupportWithoutSibylSuggestions,
	showQandAOnInlineHelpContactForm,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HelpContactForm ) );
