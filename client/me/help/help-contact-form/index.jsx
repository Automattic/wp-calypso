/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';

module.exports = React.createClass( {
	displayName: 'HelpContactForm',

	mixins: [ React.addons.LinkedStateMixin, React.addons.PureRenderMixin ],

	propTypes: {
		buttonLabel: React.PropTypes.string.isRequired,
		onSubmit: React.PropTypes.func.isRequired,
		showHowCanWeHelpField: React.PropTypes.bool,
		showHowYouFeelField: React.PropTypes.bool,
		showSubjectField: React.PropTypes.bool,
		disabled: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			showHowCanWeHelpField: false,
			showHowYouFeelField: false,
			showSubjectField: false,
			disabled: false
		}
	},

	/**
	 * Setup our initial state
	 * @return {Object} An object representing our initial state
	 */
	getInitialState: function() {
		return {
			howCanWeHelp: 'gettingStarted',
			howYouFeel: 'unspecified',
			message: '',
			subject: ''
		};
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
				onClick: () => {
					this.setState( { [ selectionName ]: option.value } )
				}
			}
		} ) );

		const selectedItem = options.filter( o => o.props.selected )[0];

		return (
			<div className="help-contact-form__selection">
				<SegmentedControl>
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
				{ value: 'gettingStarted', label: this.translate( 'Help getting started' ), subtext: this.translate( 'Can you show me how to...' ) },
				{ value: 'somethingBroken', label: this.translate( 'Something is broken' ), subtext: this.translate( 'Can you check this out...' ) },
				{ value: 'suggestion', label: this.translate( 'I have a suggestion' ), subtext: this.translate( 'I think it would be cool if...' ) }
			],
			howYouFeelOptions = [
				{ value: 'unspecified', label: this.translate( "I'd rather not" ) },
				{ value: 'happy', label: this.translate( 'Happy' ) },
				{ value: 'confused', label: this.translate( 'Confused' ) },
				{ value: 'discouraged', label: this.translate( 'Discouraged' ) },
				{ value: 'upset', label: this.translate( 'Upset' ) },
				{ value: 'panicked', label: this.translate( 'Panicked' ) }
			];

		const { buttonLabel, showHowCanWeHelpField, showHowYouFeelField, showSubjectField } = this.props;

		return (
			<div className="help-contact-form">
				{ showHowCanWeHelpField ? (
					<div>
						<FormLabel>{ this.translate( 'How can we help?' ) }</FormLabel>
						{ this.renderFormSelection( 'howCanWeHelp', howCanWeHelpOptions ) }
					</div>
				) : null }

				{ showHowYouFeelField ? (
					<div>
						<FormLabel>{ this.translate( 'Mind sharing how you feel?' ) }</FormLabel>
						{ this.renderFormSelection( 'howYouFeel', howYouFeelOptions ) }
					</div>
				) : null }

				{ showSubjectField ? (
					<div className="help-contact-form__subject">
						<FormLabel>{ this.translate( 'Subject' ) }</FormLabel>
						<FormTextInput valueLink={ this.linkState( 'subject' ) } />
					</div>
				) : null }

				<FormLabel>{ this.translate( 'What are you trying to do?' ) }</FormLabel>
				<FormTextarea valueLink={ this.linkState( 'message' ) } placeholder={ this.translate( 'Please be descriptive' ) }></FormTextarea>

				<FormButton disabled={ ! this.canSubmitForm() } type="button" onClick={ this.submitForm }>{ buttonLabel }</FormButton>
			</div>
		);
	}
} );
