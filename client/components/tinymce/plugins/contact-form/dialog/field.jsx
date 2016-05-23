/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import FieldHeader from './field-header';
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormCheckbox from 'components/forms/form-checkbox';
import FormTextValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import TokenField from 'components/token-field';
import FieldRemoveButton from './field-remove-button';
import getLabel from './locales';

/**
 *
 */
const fieldTypes = [ 'checkbox', 'select', 'email', 'name', 'radio', 'text', 'textarea', 'url' ];

export default React.createClass( {
	displayName: 'ContactFormDialogField',

	mixins: [ PureRenderMixin ],

	propTypes: {
		label: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		options: PropTypes.string,
		required: PropTypes.bool,
		onUpdate: PropTypes.func.isRequired,
		onRemove: PropTypes.func.isRequired,
		isExpanded: PropTypes.bool
	},

	renderOptions() {
		if ( this.props.type !== 'radio' && this.props.type !== 'select' ) {
			return;
		}

		let { options } = this.props;
		options = !!options ? options.split( ',' ) : [];

		const optionsValidationError = ! options || options.length === 0;

		return (
			<FormFieldset>
				<FormLabel>{ this.translate( 'Options' ) }</FormLabel>
				<TokenField
					value={ options }
					onChange={ tokens => this.props.onUpdate( { options: tokens.join() } ) }/>
				{ optionsValidationError && <FormTextValidation isError={ true } text={ this.translate( 'Options can not be empty.' ) } /> }
				<FormSettingExplanation>Insert an option and press enter.</FormSettingExplanation>
			</FormFieldset>
		);
	},

	onLabelChange( event ) {
		this.props.onUpdate( { label: event.target.value } );
	},

	render() {
		const fielLabelValidationError = ! this.props.label;
		const remove = <FieldRemoveButton onRemove={ this.props.onRemove } />;

		return (
			<FoldableCard
				header={ <FieldHeader { ...omit( this.props, [ 'onUpdate' ] ) } /> }
				summary={ remove }
				expandedSummary={ remove }
				icon="pencil"
				expanded={ this.props.isExpanded }
				onOpen={ () => this.props.onUpdate( { isExpanded: true } ) }
				onClose={ () => this.props.onUpdate( { isExpanded: false } ) }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Field Label' ) }</FormLabel>
					<FormTextInput value={ this.props.label } onChange={ this.onLabelChange } isError={ fielLabelValidationError } />
					{ fielLabelValidationError && <FormTextValidation isError={ true } text={ this.translate( 'Field Label can not be empty.' ) } /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Field Type' ) }</FormLabel>
					<SelectDropdown selectedText={ getLabel( this.props.type ) }>
						{ fieldTypes.map( fieldType => (
							<DropdownItem
								key={ 'field-type-' + fieldType }
								selected={ this.props.type === fieldType }
								onClick={ () => this.props.onUpdate( { type: fieldType } ) }>
								{ getLabel( fieldType ) }
							</DropdownItem>
						) ) }
					</SelectDropdown>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						<FormCheckbox
							checked={ this.props.required }
							onChange={ () => this.props.onUpdate( { required: ! this.props.required } ) } />
						<span>{ this.translate( 'Required' ) }</span>
					</FormLabel>
				</FormFieldset>

				{ this.renderOptions() }

			</FoldableCard>
		);
	}
} );
