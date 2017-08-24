/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import ReduxFormFieldset from 'components/redux-forms/redux-form-fieldset';
import SectionHeader from 'components/section-header';

const form = 'extensions.zoninator.zoneDetails';

const ZoneDetailsForm = ( {
	handleSubmit,
	label,
	onSubmit,
	submitting,
} ) => {
	const save = data => onSubmit( form, data );

	return (
		<form onSubmit={ handleSubmit( save ) }>
			<SectionHeader label={ label }>
				<FormButton
					compact
					disabled={ submitting }
					isSubmitting={ submitting }>
					{ translate( 'Save' ) }
				</FormButton>
			</SectionHeader>
			<CompactCard>
				<ReduxFormFieldset
					name="name"
					label={ translate( 'Zone name' ) }
					component={ FormTextInput } />
				<ReduxFormFieldset
					name="description"
					label={ translate( 'Zone description' ) }
					component={ FormTextarea } />
			</CompactCard>
		</form>
	);
};

ZoneDetailsForm.propTypes = {
	label: PropTypes.string.isRequired,
	onSubmit: PropTypes.func.isRequired,
};

const createReduxForm = reduxForm( {
	form,
	validate: ( data ) => {
		const errors = {};

		if ( ! data.name ) {
			errors.name = translate( 'Zone name cannot be empty.' );
		}

		return errors;
	},
} );

export default createReduxForm( ZoneDetailsForm );
