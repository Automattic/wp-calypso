/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { omit } from 'lodash';

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
import TokenField from 'components/token-field';
import FieldRemoveButton from './field-remove-button';
import FieldEditButton from './field-edit-button';
import getLabel from './locales';

/**
 *
 */
const fieldTypes = [ 'checkbox', 'select', 'email', 'name', 'radio', 'text', 'textarea', 'url' ];

class ContactFormDialogField extends React.PureComponent {
	static displayName = 'ContactFormDialogField';

	static propTypes = {
		label: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		options: PropTypes.string,
		required: PropTypes.bool,
		onUpdate: PropTypes.func.isRequired,
		onRemove: PropTypes.func.isRequired,
		isExpanded: PropTypes.bool,
	};

	renderOptions = () => {
		if ( this.props.type !== 'radio' && this.props.type !== 'select' ) {
			return;
		}

		let { options } = this.props;
		options = options ? options.split( ',' ) : [];

		const optionsValidationError = ! options || options.length === 0;

		return (
			<FormFieldset>
				<FormLabel>{ this.props.translate( 'Options' ) }</FormLabel>
				<TokenField
					value={ options }
					onChange={ ( tokens ) => this.props.onUpdate( { options: tokens.join() } ) }
				/>
				{ optionsValidationError && (
					<FormTextValidation
						isError={ true }
						text={ this.props.translate( 'Options can not be empty.' ) }
					/>
				) }
				<FormSettingExplanation>Insert an option and press enter.</FormSettingExplanation>
			</FormFieldset>
		);
	};

	onLabelChange = ( event ) => {
		this.props.onUpdate( { label: event.target.value } );
	};

	handleCardOpen = () => {
		this.props.onUpdate( { isExpanded: true } );
	};

	handleCardClose = () => {
		this.props.onUpdate( { isExpanded: false } );
	};

	render() {
		const fielLabelValidationError = ! this.props.label;
		const remove = <FieldRemoveButton onRemove={ this.props.onRemove } />;

		return (
			<FoldableCard
				header={ <FieldHeader { ...omit( this.props, [ 'onUpdate' ] ) } /> }
				summary={ remove }
				expandedSummary={ remove }
				expanded={ this.props.isExpanded }
				onClose={ this.handleCardClose }
				onOpen={ this.handleCardOpen }
				actionButton={ <FieldEditButton expanded={ false } /> }
				actionButtonExpanded={ <FieldEditButton expanded={ true } /> }
			>
				<FormFieldset>
					<FormLabel>{ this.props.translate( 'Field Label' ) }</FormLabel>
					<FormTextInput
						value={ this.props.label }
						onChange={ this.onLabelChange }
						isError={ fielLabelValidationError }
					/>
					{ fielLabelValidationError && (
						<FormTextValidation
							isError={ true }
							text={ this.props.translate( 'Field Label can not be empty.' ) }
						/>
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.props.translate( 'Field Type' ) }</FormLabel>
					<SelectDropdown selectedText={ getLabel( this.props.type ) }>
						{ fieldTypes.map( ( fieldType ) => (
							<SelectDropdown.Item
								key={ 'field-type-' + fieldType }
								selected={ this.props.type === fieldType }
								onClick={ () => this.props.onUpdate( { type: fieldType } ) }
							>
								{ getLabel( fieldType ) }
							</SelectDropdown.Item>
						) ) }
					</SelectDropdown>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						<FormCheckbox
							checked={ this.props.required }
							onChange={ () => this.props.onUpdate( { required: ! this.props.required } ) }
						/>
						<span>{ this.props.translate( 'Required' ) }</span>
					</FormLabel>
				</FormFieldset>

				{ this.renderOptions() }
			</FoldableCard>
		);
	}
}

export default localize( ContactFormDialogField );
