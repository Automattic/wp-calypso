/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { has } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import DomainsSelect from './domains-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import { getGSuiteSupportedDomains } from 'lib/domains/gsuite';

/**
 * Style dependencies
 */
import './add-users.scss';

class NewUserForm extends React.Component {
	handleFieldFocus( fieldName ) {
		this.props.recordInputFocus( this.props.selectedDomainName, fieldName );
	}

	renderNameFieldset( firstName, lastName ) {
		const { handleFieldChange, translate } = this.props;

		const isFirstNameError = has( firstName, 'error' ) && null !== firstName.error;
		const isLastNameError = has( lastName, 'error' ) && null !== lastName.error;

		return (
			<Fragment>
				<FormFieldset>
					<FormTextInput
						isError={ isFirstNameError }
						maxLength={ 60 }
						name="firstName"
						onChange={ handleFieldChange.bind( this, 'firstName' ) }
						onFocus={ this.handleFieldFocus.bind( this, 'First Name' ) }
						placeholder={ translate( 'First Name' ) }
						value={ firstName.value }
					/>
					{ isFirstNameError && (
						<FormInputValidation isError text={ firstName.error || '\u00A0' } />
					) }
				</FormFieldset>
				<FormFieldset>
					<FormTextInput
						isError={ isLastNameError }
						maxLength={ 60 }
						name="lastName"
						onChange={ handleFieldChange.bind( this, 'lastName' ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Last Name' ) }
						placeholder={ translate( 'Last Name' ) }
						value={ lastName.value }
					/>
					{ isLastNameError && <FormInputValidation isError text={ lastName.error || '\u00A0' } /> }
				</FormFieldset>
			</Fragment>
		);
	}

	emailAddressFieldset( username, domain ) {
		const { handleFieldChange, translate } = this.props;
		const isError =
			( has( username, 'error' ) && null !== username.error ) ||
			( has( domain, 'error' ) && null !== domain.error );
		const errorMessage = isError ? username.error || domain.error : '\u00A0';

		return (
			<div className="gsuite-add-users__email-address-fieldset">
				<div>
					<FormTextInput
						isError={ isError }
						onChange={ handleFieldChange.bind( this, 'username' ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Email' ) }
						placeholder={ translate( 'e.g. contact' ) }
						type="text"
						value={ username.value }
					/>
					<DomainsSelect
						domains={ getGSuiteSupportedDomains( this.props.domains ) }
						isError={ isError }
						isRequestingSiteDomains={ this.props.isRequestingSiteDomains }
						onChange={ handleFieldChange.bind( this, 'domain' ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Domain' ) }
						value={ domain.value }
					/>
				</div>
				{ isError && <FormInputValidation isError text={ errorMessage } /> }
			</div>
		);
	}

	render() {
		const { user } = this.props;
		return (
			<Fragment>
				<div className="gsuite-add-users__email-address-fieldsets">
					{ this.emailAddressFieldset( user.username, user.domain ) }
				</div>
				<div className="gsuite-add-users__name-fieldsets">
					{ this.renderNameFieldset( user.firstName, user.lastName ) }
				</div>
			</Fragment>
		);
	}
}

const recordInputFocus = ( domainName, fieldName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Focused On "${ fieldName }" Input for a User in Add G Suite user`,
			'Domain Name',
			domainName
		),
		recordTracksEvent( `calypso_domain_management_add_gsuite_field_focus`, {
			domain_name: domainName,
			field_name: fieldName,
		} )
	);

NewUserForm.propTypes = {
	domains: PropTypes.array.isRequired,
	handleFieldChange: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	user: PropTypes.object.isRequired,
};

export default connect(
	null,
	{
		recordInputFocus,
	}
)( localize( NewUserForm ) );
