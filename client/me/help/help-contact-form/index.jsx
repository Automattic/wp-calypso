/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { debounce, isEqual, find } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import FormLabel from 'components/forms/form-label';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import SitesDropdown from 'components/sites-dropdown';
import ChatBusinessConciergeNotice from '../chat-business-concierge-notice';
import { selectSiteId } from 'state/help/actions';
import { getHelpSelectedSite, getHelpSelectedSiteId } from 'state/help/selectors';
import wpcomLib from 'lib/wp';
import HelpResults from 'me/help/help-results';
import { bumpStat, recordTracksEvent, composeAnalytics } from 'state/analytics/actions';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { generateSubjectFromMessage } from './utils';
import { decodeEntities, preventWidows } from 'lib/formatting';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();

const trackSibylClick = ( event, helpLink ) =>
	composeAnalytics(
		bumpStat( 'sibyl_question_clicks', helpLink.id ),
		recordTracksEvent( 'calypso_sibyl_question_click', {
			question_id: helpLink.id,
		} )
	);

const trackSupportAfterSibylClick = () =>
	composeAnalytics( recordTracksEvent( 'calypso_sibyl_support_after_question_click' ) );

export class HelpContactForm extends React.PureComponent {
	static propTypes = {
		additionalSupportOption: PropTypes.object,
		formDescription: PropTypes.node,
		buttonLabel: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		showHowCanWeHelpField: PropTypes.bool,
		showHowYouFeelField: PropTypes.bool,
		showSubjectField: PropTypes.bool,
		showSiteField: PropTypes.bool,
		showHelpLanguagePrompt: PropTypes.bool,
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
		showHowCanWeHelpField: false,
		showHowYouFeelField: false,
		showSubjectField: false,
		showSiteField: false,
		showHelpLanguagePrompt: false,
		disabled: false,
		valueLink: {
			value: null,
			requestChange: () => {},
		},
	};

	/**
	 * Setup our initial state
	 * @return {Object} An object representing our initial state
	 */
	state = this.props.valueLink.value || {
		howCanWeHelp: 'gettingStarted',
		howYouFeel: 'unspecified',
		message: '',
		subject: '',
		sibylClicked: false,
		qanda: [],
		showingQandAStep: false,
	};

	componentDidMount() {
		this.debouncedQandA = debounce( this.doQandASearch, 500 );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.valueLink.value || isEqual( nextProps.valueLink.value, this.state ) ) {
			return;
		}

		this.setState( nextProps.valueLink.value );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.subject !== this.state.subject || prevState.message !== this.state.message ) {
			this.debouncedQandA();
		}
		this.props.valueLink.requestChange( this.state );
	}

	trackClickStats = ( selectionName, selectedOption ) => {
		const tracksEvent = {
			howCanWeHelp: 'calypso_help_how_can_we_help_click',
			howYouFeel: 'calypso_help_how_you_feel_click',
		}[ selectionName ];

		if ( tracksEvent ) {
			analytics.tracks.recordEvent( tracksEvent, { selected_option: selectedOption } );
		}
	};

	doQandASearch = () => {
		const query = this.state.subject + ' ' + this.state.message;
		const areSameQuestions = ( existingQuestions, newQuestions ) => {
			const existingIDs = existingQuestions.map( question => question.id );
			existingIDs.sort();
			const newIDs = newQuestions.map( question => question.id );
			newIDs.sort();
			return existingIDs.toString() === newIDs.toString();
		};
		const site = this.props.helpSite.jetpack
			? config( 'jetpack_support_blog' )
			: config( 'wpcom_support_blog' );

		wpcom
			.getQandA( query, site )
			.then( qanda =>
				this.setState( {
					qanda,
					// only keep sibylClicked true if the user is seeing the same set of questions
					// we don't want to track "questions -> question click -> different questions -> support click",
					// so we need to set sibylClicked to false here if the questions have changed
					sibylClicked: this.state.sibylClicked && areSameQuestions( this.state.qanda, qanda ),
				} )
			)
			.catch( () => this.setState( { qanda: [], sibylClicked: false } ) );
	};

	trackSibylClick = ( event, helpLink ) => {
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
	 * @return {object}                  A JSX object containing both the SegmentedControl and the SelectDropdown.
	 */
	renderFormSelection = ( selectionName, selectionOptions ) => {
		const { translate } = this.props;
		const options = selectionOptions.map( option => ( {
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
					{ options.map( option => (
						<ControlItem { ...option.props }>
							{ option.label }
							{ option.subtext }
						</ControlItem>
					) ) }
				</SegmentedControl>
				<SelectDropdown
					selectedText={ selectedItem ? selectedItem.label : translate( 'Select an option' ) }
				>
					{ options.map( option => (
						<DropdownItem { ...option.props }>{ option.label }</DropdownItem>
					) ) }
				</SelectDropdown>
			</div>
		);
	};

	/**
	 * Determine if this form is ready to submit
	 * @return {bool}	Return true if this form can be submitted
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
	 * @param  {object} event Event object
	 */
	submitForm = () => {
		const { howCanWeHelp, howYouFeel, message } = this.state;
		const { additionalSupportOption, currentUserLocale, compact } = this.props;
		const subject = compact ? generateSubjectFromMessage( message ) : this.state.subject;

		if ( additionalSupportOption && additionalSupportOption.enabled ) {
			this.props.recordTracksEvent( 'calypso_happychat_a_b_english_chat_selected', {
				locale: currentUserLocale,
			} );
		}

		if ( this.state.sibylClicked ) {
			// track that the user had clicked a Sibyl result, but still contacted support
			this.props.trackSupportAfterSibylClick();
			this.setState( { sibylClicked: false } );
		}

		this.props.onSubmit( {
			howCanWeHelp,
			howYouFeel,
			message,
			subject,
			site: this.props.helpSite,
		} );
	};

	/**
	 * Submit additional support option
	 * @param  {object} event Event object
	 */
	submitAdditionalForm = () => {
		const { howCanWeHelp, howYouFeel, message } = this.state;
		const { currentUserLocale } = this.props;
		const subject = generateSubjectFromMessage( message );

		this.props.recordTracksEvent( 'calypso_happychat_a_b_native_ticket_selected', {
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

	toggleShowQandAStep = () => {
		this.setState( { showingQandAStep: ! this.state.showingQandAStep } );
	};

	renderCompactQandAResults = () => {
		return (
			<ul>
				{ this.state.qanda.map( link => (
					<li key={ link.link }>
						<a href={ link.link } title={ decodeEntities( link.description ) }>
							{ preventWidows( decodeEntities( link.title ) ) }
						</a>
					</li>
				) ) }
			</ul>
		);
	};

	/**
	 * Render the contact form
	 * @return {object} ReactJS JSX object
	 */
	render() {
		const {
			additionalSupportOption,
			formDescription,
			buttonLabel,
			showHowCanWeHelpField,
			showHowYouFeelField,
			showSubjectField,
			showSiteField,
			showQASuggestions,
			showHelpLanguagePrompt,
			translate,
		} = this.props;
		const { showingQandAStep } = this.state;
		const hasQASuggestions = this.state.qanda.length > 0;

		const howCanWeHelpOptions = [
			{
				value: 'gettingStarted',
				label: translate( 'Help getting started' ),
				subtext: translate( 'Can you show me how to…' ),
			},
			{
				value: 'somethingBroken',
				label: translate( 'Something is broken' ),
				subtext: translate( 'Can you check this out…' ),
			},
			{
				value: 'suggestion',
				label: translate( 'I have a suggestion' ),
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

		if ( showingQandAStep ) {
			return (
				<div className="help-contact-form">
					<p>{ translate( 'Did you want the answer to any of these questions?' ) }</p>
					{ this.renderCompactQandAResults() }
					<FormButton onClick={ this.toggleShowQandAStep }>
						<Gridicon icon="chevron-left" />
						Edit my message
					</FormButton>
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

				<ChatBusinessConciergeNotice
					from="2017-07-19T00:00:00Z"
					to="2017-07-21T00:00:00Z"
					selectedSite={ this.props.helpSite }
				/>

				{ showHowCanWeHelpField && (
					<div>
						<FormLabel>{ translate( 'How can we help?' ) }</FormLabel>
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
						<FormLabel>{ translate( 'Which site do you need help with?' ) }</FormLabel>
						<SitesDropdown
							selectedSiteId={ this.props.helpSiteId }
							onSiteSelect={ this.props.onChangeSite }
						/>
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
					/>
				) }

				{ ! showQASuggestions &&
					hasQASuggestions && (
						<FormButton type="button" onClick={ this.toggleShowQandAStep }>
							{ translate( 'Continue' ) }
						</FormButton>
					) }

				{ ( showQASuggestions || ( ! showQASuggestions && ! hasQASuggestions ) ) && (
					<FormButton disabled={ ! this.canSubmitForm() } type="button" onClick={ this.submitForm }>
						{ buttonLabel }
					</FormButton>
				) }

				{ additionalSupportOption &&
					additionalSupportOption.enabled && (
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

	handleChange = e => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

const mapStateToProps = state => ( {
	currentUserLocale: getCurrentUserLocale( state ),
	helpSite: getHelpSelectedSite( state ),
	helpSiteId: getHelpSelectedSiteId( state ),
} );

const mapDispatchToProps = {
	onChangeSite: selectSiteId,
	recordTracksEvent,
	trackSibylClick,
	trackSupportAfterSibylClick,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HelpContactForm ) );
