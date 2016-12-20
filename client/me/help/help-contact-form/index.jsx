/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import PureRenderMixin from 'react-pure-render/mixin';
import { isEqual, find } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import FormLabel from 'components/forms/form-label';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import SitesDropdown from 'components/sites-dropdown';
import siteList from 'lib/sites-list';
import ChatClosureNotice from '../chat-closure-notice';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Module variables
 */
const sites = siteList();

export const HelpContactForm = React.createClass( {
	mixins: [ LinkedStateMixin, PureRenderMixin ],

	propTypes: {
		formDescription: PropTypes.node,
		buttonLabel: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		showHowCanWeHelpField: PropTypes.bool,
		showHowYouFeelField: PropTypes.bool,
		showSubjectField: PropTypes.bool,
		showSiteField: PropTypes.bool,
		showHelpLanguagePrompt: PropTypes.bool,
		siteFilter: PropTypes.func,
		siteList: PropTypes.object,
		disabled: PropTypes.bool,
		valueLink: PropTypes.shape( {
			value: PropTypes.any,
			requestChange: PropTypes.func.isRequired
		} ),
	},

	getDefaultProps() {
		return {
			formDescription: '',
			showHowCanWeHelpField: false,
			showHowYouFeelField: false,
			showSubjectField: false,
			showSiteField: false,
			showHelpLanguagePrompt: false,
			disabled: false,
			valueLink: {
				value: null,
				requestChange: () => {}
			}
		};
	},

	/**
	 * Setup our initial state
	 * @return {Object} An object representing our initial state
	 */
	getInitialState() {
		return this.props.valueLink.value || {
			howCanWeHelp: 'gettingStarted',
			howYouFeel: 'unspecified',
			message: '',
			subject: '',
			siteId: this.getSiteId()
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.valueLink.value || isEqual( nextProps.valueLink.value, this.state ) ) {
			return;
		}

		this.setState( nextProps.valueLink.value );
	},

	componentDidUpdate() {
		this.props.valueLink.requestChange( this.state );
	},

	getSiteId() {
		if ( this.props.selectedSiteId ) {
			return this.props.selectedSiteId;
		}

		const primarySite = sites.getPrimary();
		if ( primarySite ) {
			return primarySite.ID;
		}

		return null;
	},

	setSite( siteSlug ) {
		const site = sites.getSite( siteSlug );
		this.setState( { siteId: site.ID } );
	},

	trackClickStats( selectionName, selectedOption ) {
		const tracksEvent = {
			howCanWeHelp: 'calypso_help_how_can_we_help_click',
			howYouFeel: 'calypso_help_how_you_feel_click'
		}[ selectionName ];

		if ( tracksEvent ) {
			analytics.tracks.recordEvent( tracksEvent, { selected_option: selectedOption } );
		}
	},

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
	renderFormSelection( selectionName, selectionOptions ) {
		const { translate } = this.props;
		const options = selectionOptions.map( option => ( {
			label: option.label,
			subtext: option.subtext ? <span className="help-contact-form__selection-subtext">{ option.subtext }</span> : null,
			props: {
				key: option.value,
				selected: option.value === this.state[ selectionName ],
				value: option.value,
				title: option.label,
				onClick: () => {
					this.setState( { [ selectionName ]: option.value } );
					this.trackClickStats( selectionName, option.value );
				}
			}
		} ) );
		const selectedItem = find( options, 'props.selected' );

		return (
			<div className="help-contact-form__selection">
				<SegmentedControl primary>
					{ options.map( option => <ControlItem { ...option.props }>{ option.label }{ option.subtext }</ControlItem> ) }
				</SegmentedControl>
				<SelectDropdown selectedText={ selectedItem ? selectedItem.label : translate( 'Select an option' ) }>
					{ options.map( option => <DropdownItem { ...option.props }>{ option.label }</DropdownItem> ) }
				</SelectDropdown>
			</div>
		);
	},

	/**
	 * Determine if this form is ready to submit
	 * @return {bool}	Return true if this form can be submitted
	 */
	canSubmitForm() {
		const { disabled, showSubjectField } = this.props;
		const { subject, message } = this.state;

		if ( disabled ) {
			return false;
		}

		if ( showSubjectField && ! subject.trim() ) {
			return false;
		}

		return !! message.trim();
	},

	/**
	 * Start a chat using the info set in state
	 * @param  {object} event Event object
	 */
	submitForm() {
		this.props.onSubmit( this.state );
	},

	/**
	 * Render the contact form
	 * @return {object} ReactJS JSX object
	 */
	render() {
		const {
			formDescription,
			buttonLabel,
			showHowCanWeHelpField,
			showHowYouFeelField,
			showSubjectField,
			showSiteField,
			showHelpLanguagePrompt,
			translate,
		} = this.props;
		const howCanWeHelpOptions = [
			{ value: 'gettingStarted', label: translate( 'Help getting started' ), subtext: translate( 'Can you show me how to…' ) },
			{ value: 'somethingBroken', label: translate( 'Something is broken' ), subtext: translate( 'Can you check this out…' ) },
			{ value: 'suggestion', label: translate( 'I have a suggestion' ), subtext: translate( 'I think it would be cool if…' ) }
		];
		const howYouFeelOptions = [
			{ value: 'unspecified', label: translate( "I'd rather not" ) },
			{ value: 'happy', label: translate( 'Happy' ) },
			{ value: 'confused', label: translate( 'Confused' ) },
			{ value: 'discouraged', label: translate( 'Discouraged' ) },
			{ value: 'upset', label: translate( 'Upset' ) },
			{ value: 'panicked', label: translate( 'Panicked' ) }
		];

		return (
			<div className="help-contact-form">
				<ChatClosureNotice
					reason="eoy-holidays"
					from="2016-12-24T00:00:00Z"
					to="2017-01-02T00:00:00Z"
				/>
				{ formDescription && ( <p>{ formDescription }</p> ) }

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
							selectedSiteId={ this.state.siteId }
							onSiteSelect={ this.setSite } />
					</div>
				) }

				{ showSubjectField && (
					<div className="help-contact-form__subject">
						<FormLabel>{ translate( 'Subject' ) }</FormLabel>
						<FormTextInput valueLink={ this.linkState( 'subject' ) } />
					</div>
				) }

				<FormLabel>{ translate( 'What are you trying to do?' ) }</FormLabel>
				<FormTextarea valueLink={ this.linkState( 'message' ) } placeholder={ translate( 'Please be descriptive' ) } />

				{ showHelpLanguagePrompt && (
					<strong className="help-contact-form__help-language-prompt">
						{ translate( 'Note: Support is only available in English at the moment.' ) }
					</strong>
				) }
				<FormButton disabled={ ! this.canSubmitForm() } type="button" onClick={ this.submitForm }>{ buttonLabel }</FormButton>
			</div>
		);
	}
} );

const mapStateToProps = ( state ) => {
	return {
		selectedSiteId: getSelectedSiteId( state )
	};
};

export default connect( mapStateToProps )( localize( HelpContactForm ) );
