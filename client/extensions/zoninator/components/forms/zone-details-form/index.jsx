/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight, mapValues, trim } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import ReduxFormFieldset from 'components/redux-forms/redux-form-fieldset';
import SectionHeader from 'components/section-header';

const form = 'extensions.zoninator.zoneDetails';

class ZoneDetailsForm extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
		handleSubmit: PropTypes.func.isRequired,
		label: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		requesting: PropTypes.bool,
		submitting: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	};

	save = ( data ) => this.props.onSubmit( form, mapValues( data, trim ) );

	render() {
		const { disabled, handleSubmit, label, requesting, submitting, translate } = this.props;
		const isDisabled = disabled || requesting || submitting;

		return (
			<form onSubmit={ handleSubmit( this.save ) }>
				<SectionHeader label={ label }>
					<FormButton compact disabled={ isDisabled }>
						{ translate( 'Save' ) }
					</FormButton>
				</SectionHeader>
				<CompactCard>
					<ReduxFormFieldset
						name="name"
						label={ translate( 'Zone name' ) }
						component={ FormTextInput }
					/>
					<ReduxFormFieldset
						name="description"
						label={ translate( 'Zone description' ) }
						component={ FormTextarea }
					/>
				</CompactCard>
			</form>
		);
	}
}

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form,
	validate: ( data, { translate } ) => {
		const errors = {};

		if ( ! /[a-z0-9]/i.test( data.name ) ) {
			errors.name = translate( 'Zone name must contain at least one alphanumeric character.' );
		}

		if ( ! data.name ) {
			errors.name = translate( 'Zone name cannot be empty.' );
		}

		return errors;
	},
} );

export default flowRight( localize, createReduxForm )( ZoneDetailsForm );
