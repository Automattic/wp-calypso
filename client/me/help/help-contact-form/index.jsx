/**
 * External dependencies
 */
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import PureRenderMixin from 'react-pure-render/mixin';
import isEqual from 'lodash/isEqual';

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

/**
 * Module variables
 */
const sites = siteList();

module.exports = React.createClass( {
	displayName: 'HelpContactForm',

	mixins: [ LinkedStateMixin, PureRenderMixin ],

	propTypes: {
		formDescription: React.PropTypes.node,
		buttonLabel: React.PropTypes.string.isRequired,
		onSubmit: React.PropTypes.func.isRequired,
		showHowCanWeHelpField: React.PropTypes.bool,
		showHowYouFeelField: React.PropTypes.bool,
		showSubjectField: React.PropTypes.bool,
		showSiteField: React.PropTypes.bool,
		showHelpLanguagePrompt: React.PropTypes.bool,
		siteFilter: React.PropTypes.func,
		siteList: React.PropTypes.object,
		disabled: React.PropTypes.bool,
		valueLink: React.PropTypes.shape( {
			value: React.PropTypes.any,
			requestChange: React.PropTypes.func.isRequired
		} ),
	},

	getDefaultProps: function() {
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
		}
	},

	/**
	 * Setup our initial state
	 * @return {Object} An object representing our initial state
	 */
	getInitialState: function() {
		const site = sites.getLastSelectedSite() || sites.getPrimary();

		return this.props.valueLink.value || {
			howCanWeHelp: 'gettingStarted',
			howYouFeel: 'unspecified',
			message: '',
			subject: '',
			siteSlug: site ? site.slug : null
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! nextProps.valueLink.value || isEqual( nextProps.valueLink.value, this.state ) ) {
			return;
		}

		this.setState( nextProps.valueLink.value );
	},

	componentDidUpdate: function() {
		this.props.valueLink.requestChange( this.state );
	},

	setSite: function( siteSlug ) {
		this.setState( { siteSlug } );
	},

	trackClickStats: function( selectionName, selectedOption ) {
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
	 * @param  {string} selectionName    The name that will be used to store the value of a selected option that appears in selectionOptions.
	 * @param  {object} selectionOptions An array of objects consisting of a value and a label. It can also have a property called subtext
	 *                                   value is used when setting state, label is used for display in the selection component, and subtext
	 *                                   is used for the second line of text displayed in the SegmentedControl
	 * @return {object}                  A JSX object containing both the SegmentedControl and the SelectDropdown.
	 */
	renderFormSelection: function( selectionName, selectionOptions ) {
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

		const selectedItem = options.filter( o => o.props.selected )[0];

		return (
			<div className="help-contact-form__selection">
				<SegmentedControl primary>
					{ options.map( option => <ControlItem { ...option.props }>{ option.label }{ option.subtext }</ControlItem> ) }
				</SegmentedControl>
				<SelectDropdown selectedText={ selectedItem ? selectedItem.label : this.translate( 'Select an option' ) }>
					{ options.map( option => <DropdownItem { ...option.props }>{ option.label }</DropdownItem> ) }
				</SelectDropdown>
			</div>
		);
	},

	/**
	 * Determine if this form is ready to submit
	 * @return {bool}	Return true if this form can be submitted
	 */
	canSubmitForm: function() {
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
	submitForm: function() {
		this.props.onSubmit( this.state );
	},

	/**
	 * Render the contact form
	 * @return {object} ReactJS JSX object
	 */
	render: function() {
		var howCanWeHelpOptions = [
				{ value: 'gettingStarted', label: this.translate( 'Help getting started' ), subtext: this.translate( 'Can you show me how to…' ) },
				{ value: 'somethingBroken', label: this.translate( 'Something is broken' ), subtext: this.translate( 'Can you check this out…' ) },
				{ value: 'suggestion', label: this.translate( 'I have a suggestion' ), subtext: this.translate( 'I think it would be cool if…' ) }
			],
			howYouFeelOptions = [
				{ value: 'unspecified', label: this.translate( "I'd rather not" ) },
				{ value: 'happy', label: this.translate( 'Happy' ) },
				{ value: 'confused', label: this.translate( 'Confused' ) },
				{ value: 'discouraged', label: this.translate( 'Discouraged' ) },
				{ value: 'upset', label: this.translate( 'Upset' ) },
				{ value: 'panicked', label: this.translate( 'Panicked' ) }
			];

		const {
			formDescription,
			buttonLabel,
			showHowCanWeHelpField,
			showHowYouFeelField,
			showSubjectField,
			showSiteField,
			showHelpLanguagePrompt,
		} = this.props;

		return (
			<div className="help-contact-form">
				{ formDescription && ( <p>{ formDescription }</p> ) }

				{ showHowCanWeHelpField && (
					<div>
						<FormLabel>{ this.translate( 'How can we help?' ) }</FormLabel>
						{ this.renderFormSelection( 'howCanWeHelp', howCanWeHelpOptions ) }
					</div>
				) }

				{ showHowYouFeelField && (
					<div>
						<FormLabel>{ this.translate( 'Mind sharing how you feel?' ) }</FormLabel>
						{ this.renderFormSelection( 'howYouFeel', howYouFeelOptions ) }
					</div>
				) }

				{ showSiteField && (
					<div className="help-contact-form__site-selection">
						<FormLabel>{ this.translate( 'Which site do you need help with?' ) }</FormLabel>
						<SitesDropdown
							selected={ this.state.siteSlug }
							onSiteSelect={ this.setSite } />
					</div>
				) }

				{ showSubjectField && (
					<div className="help-contact-form__subject">
						<FormLabel>{ this.translate( 'Subject' ) }</FormLabel>
						<FormTextInput valueLink={ this.linkState( 'subject' ) } />
					</div>
				) }

				<FormLabel>{ this.translate( 'What are you trying to do?' ) }</FormLabel>
				<FormTextarea valueLink={ this.linkState( 'message' ) } placeholder={ this.translate( 'Please be descriptive' ) }></FormTextarea>

				{ showHelpLanguagePrompt && (
					<strong className="help-contact-form__help-language-prompt">
						{ this.translate( 'Note: Support is only available in English at the moment.' ) }
					</strong>
				) }
				<FormButton disabled={ ! this.canSubmitForm() } type="button" onClick={ this.submitForm }>{ buttonLabel }</FormButton>
			</div>
		);
	}
} );
