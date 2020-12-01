/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { mapValues, trim } from 'lodash';

/**
 * Internal dependencies
 */
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SectionHeader from 'calypso/components/section-header';
import { CompactCard } from '@automattic/components';

class ZoneDetailsForm extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		label: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		requesting: PropTypes.bool,
		submitting: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		name: this.props.initialValues?.name ?? null,
		description: this.props.initialValues?.description ?? '',
		// Slug isn't changeable in the form, but we should pass it along when updating zones.
		slug: this.props.initialValues?.slug ?? '',
	};

	save = ( event ) => {
		event.preventDefault();

		if ( this.getNameValidationError() ) {
			return;
		}

		this.props.onSubmit( mapValues( this.state, trim ) );
	};

	createChangeHandler = ( fieldName ) => ( event ) => {
		this.setState( { [ fieldName ]: event.target.value } );
	};

	getNameValidationError() {
		const { translate } = this.props;

		if ( this.state.name === null ) {
			return;
		}

		if ( ! /[a-z0-9]/i.test( this.state.name ) ) {
			return translate( 'Zone name must contain at least one alphanumeric character.' );
		}

		if ( ! this.state.name ) {
			return translate( 'Zone name cannot be empty.' );
		}

		return;
	}

	render() {
		const { disabled, label, requesting, submitting, translate } = this.props;
		const isDisabled = disabled || requesting || submitting;
		const nameValidationError = this.getNameValidationError();

		return (
			<form onSubmit={ this.save }>
				<SectionHeader label={ label }>
					<FormButton compact disabled={ isDisabled }>
						{ translate( 'Save' ) }
					</FormButton>
				</SectionHeader>
				<CompactCard>
					<FormFieldset>
						<FormLabel htmlFor="name">{ translate( 'Zone name' ) }</FormLabel>
						<FormTextInput
							id="name"
							name="name"
							value={ this.state.name || '' }
							onChange={ this.createChangeHandler( 'name' ) }
							isError={ !! nameValidationError }
							disabled={ isDisabled }
						/>
						{ nameValidationError && <FormInputValidation text={ nameValidationError } isError /> }
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="description">{ translate( 'Zone description' ) }</FormLabel>
						<FormTextarea
							id="description"
							name="description"
							value={ this.state.description }
							onChange={ this.createChangeHandler( 'description' ) }
							disabled={ isDisabled }
						/>
					</FormFieldset>
				</CompactCard>
			</form>
		);
	}
}

export default localize( ZoneDetailsForm );
