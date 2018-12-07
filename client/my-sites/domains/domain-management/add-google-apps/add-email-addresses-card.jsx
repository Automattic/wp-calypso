/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, groupBy, isEmpty, map, mapValues, snakeCase } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';
import page from 'page';

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import { cartItems } from 'lib/cart-values';
import { domainManagementEmail } from 'my-sites/domains/paths';
import ValidationErrorList from 'notices/validation-error-list';
import { addItem } from 'lib/upgrades/actions';
import { hasGoogleApps, getGoogleAppsSupportedDomains } from 'lib/domains';
import { filter as filterUsers, validate as validateUsers } from 'lib/domains/google-apps-users';
import DomainsSelect from './domains-select';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

function getGoogleAppsCartItems( { domains, fieldsets } ) {
	let groups = groupBy( fieldsets, function( fieldset ) {
		return fieldset.domain.value;
	} );

	groups = mapValues( groups, function( group ) {
		return map( group, function( fieldset ) {
			return {
				email: `${ fieldset.username.value }@${ fieldset.domain.value }`.toLowerCase(),
				firstname: fieldset.firstName.value,
				lastname: fieldset.lastName.value,
			};
		} );
	} );

	return map( groups, function( users, domain ) {
		const domainInfo = find( domains, { name: domain } );
		let item;
		if ( hasGoogleApps( domainInfo ) ) {
			item = cartItems.googleAppsExtraLicenses( { domain, users } );
		} else {
			item = cartItems.googleApps( { domain, users } );
		}

		return item;
	} );
}

class AddEmailAddressesCard extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			fieldsets: this.getNewFieldset(),
			validationErrors: null,
		};
	}

	getNewFieldset() {
		let domain;

		if ( this.props.selectedDomainName ) {
			domain = this.props.selectedDomainName;
		} else if ( ! this.props.isRequestingSiteDomains ) {
			domain = this.getFirstDomainName();
		} else {
			domain = null;
		}

		return [
			{
				username: { value: '' },
				domain: { value: domain },
				firstName: { value: '' },
				lastName: { value: '' },
			},
		];
	}

	removeValidationErrors() {
		this.setState( { validationErrors: null } );
	}

	validationErrors() {
		if ( this.state.validationErrors ) {
			return (
				<Notice onDismissClick={ this.removeValidationErrors } status="is-error">
					<ValidationErrorList messages={ this.state.validationErrors } />
				</Notice>
			);
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.needsToUpdateDomainFields( prevProps ) ) {
			this.setDomainFieldsToFirstDomainName();
		}
	}

	needsToUpdateDomainFields( prevProps ) {
		return (
			! this.props.selectedDomainName &&
			prevProps.isRequestingSiteDomains &&
			! this.props.isRequestingSiteDomains
		);
	}

	getFirstDomainName() {
		const domains = getGoogleAppsSupportedDomains( this.props.domains );
		return domains[ 0 ].name;
	}

	setDomainFieldsToFirstDomainName() {
		const firstDomainName = this.getFirstDomainName();
		const nextFieldsets = this.state.fieldsets.map( fieldset => {
			return update( fieldset, {
				domain: { value: { $set: firstDomainName } },
			} );
		} );

		this.setState( { fieldsets: nextFieldsets } );
	}

	render() {
		return (
			<div className="add-google-apps__card">
				{ this.validationErrors() }

				<Card className="add-google-apps__inner">
					<form className="add-google-apps__form">
						<FormLabel>{ this.props.translate( 'Add Email Addresses' ) }</FormLabel>
						{ this.renderFieldsets() }
						{ this.addAnotherEmailAddressLink() }
						{ this.formButtons() }
					</form>
				</Card>
			</div>
		);
	}

	renderFieldsets() {
		return this.state.fieldsets.map( ( _, index ) => {
			return (
				<Fragment key={ index }>
					{ index > 0 && <hr /> }
					<div className="add-google-apps__email-address-fieldsets">
						{ this.emailAddressFieldset( index ) }
					</div>
					<div className="add-google-apps__name-fieldsets">
						{ this.renderNameFieldset( index ) }
					</div>
				</Fragment>
			);
		} );
	}

	renderNameFieldset( index ) {
		const field = this.state.fieldsets[ index ];
		const { translate } = this.props;

		return (
			<Fragment key={ index }>
				<FormFieldset>
					<FormTextInput
						placeholder={ translate( 'First Name' ) }
						name="firstName"
						maxLength={ 60 }
						onChange={ this.handleFieldChange.bind( this, 'firstName', index ) }
						value={ field.firstName.value }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormTextInput
						placeholder={ translate( 'Last Name' ) }
						name="lastName"
						maxLength={ 60 }
						onChange={ this.handleFieldChange.bind( this, 'lastName', index ) }
						value={ field.lastName.value }
					/>
				</FormFieldset>
			</Fragment>
		);
	}

	emailAddressFieldset( index ) {
		const field = this.state.fieldsets[ index ];
		const contactText = this.props.translate( 'contact', {
			context: 'part of e-mail address',
			comment: 'As it would be part of an e-mail address contact@example.com',
		} );
		let suffix, select;

		if ( this.props.selectedDomainName ) {
			suffix = '@' + field.domain.value;
		} else {
			select = (
				<DomainsSelect
					domains={ getGoogleAppsSupportedDomains( this.props.domains ) }
					isRequestingSiteDomains={ this.props.isRequestingSiteDomains }
					value={ this.state.fieldsets[ index ].domain.value }
					onChange={ this.handleFieldChange.bind( this, 'domain', index ) }
					onFocus={ this.handleFieldFocus.bind( this, 'Domain', index ) }
				/>
			);
		}

		return (
			<div className="add-google-apps__email-address-fieldset" key={ index }>
				<FormTextInputWithAffixes
					onChange={ this.handleFieldChange.bind( this, 'username', index ) }
					onFocus={ this.handleFieldFocus.bind( this, 'Email', index ) }
					placeholder={ this.props.translate( 'e.g. %(example)s', {
						args: { example: contactText },
					} ) }
					suffix={ suffix }
					type="text"
					value={ field.username.value }
				/>

				{ select }
			</div>
		);
	}

	handleFieldChange( fieldName, index, event ) {
		const newValue = event.target.value;
		const command = { fieldsets: {} };

		command.fieldsets[ index ] = {};
		command.fieldsets[ index ][ fieldName ] = { value: { $set: newValue.trim() } };

		if ( fieldName === 'domain' ) {
			this.props.domainChange( newValue, index );
		}

		this.setState( update( this.state, command ) );
	}

	handleFieldFocus( fieldName, index ) {
		this.props.inputFocus( this.props.selectedDomainName, fieldName, index );
	}

	addAnotherEmailAddressLink() {
		return (
			<button
				className="add-google-apps__add-another-email-address-link"
				onClick={ this.handleAddAnotherEmailAddress }
			>
				{ this.props.translate( '+ Add another email address' ) }
			</button>
		);
	}

	handleAddAnotherEmailAddress = event => {
		event.preventDefault();

		this.setState( {
			fieldsets: this.state.fieldsets.concat( this.getNewFieldset() ),
		} );

		this.props.addAnotherEmailAddressClick( this.props.selectedDomainName );
	};

	formButtons() {
		return (
			<FormFooter className="add-google-apps__footer">
				<FormButton onClick={ this.handleContinue } disabled={ this.props.isRequestingSiteDomains }>
					{ this.props.translate( 'Continue' ) }
				</FormButton>

				<FormButton
					type="button"
					isPrimary={ false }
					onClick={ this.handleCancel }
					disabled={ this.props.isRequestingSiteDomains }
				>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>
			</FormFooter>
		);
	}

	getFields() {
		return { username: this.props.translate( 'User Name' ) };
	}

	handleContinue = event => {
		event.preventDefault();

		const validation = validateUsers( {
			users: this.state.fieldsets,
			fields: this.getFields(),
		} );

		if ( ! isEmpty( validation.errors ) ) {
			this.setState( {
				validationErrors: validation.errors,
				fieldsets: validation.users,
			} );
		}

		this.props.continueClick(
			this.props.selectedDomainName,
			isEmpty( validation.errors ),
			validation.users.length
		);

		if ( isEmpty( validation.errors ) ) {
			this.addProductsAndGoToCheckout();
		}
	};

	addProductsAndGoToCheckout() {
		const googleAppsCartItems = getGoogleAppsCartItems( {
			domains: this.props.domains,
			fieldsets: filterUsers( {
				users: this.state.fieldsets,
				fields: this.getFields(),
			} ),
		} );
		googleAppsCartItems.forEach( addItem );

		page( '/checkout/' + this.props.selectedSite.slug );
	}

	handleCancel( event ) {
		event.preventDefault();

		this.props.cancelClick( this.props.selectedDomainName );

		page( domainManagementEmail( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
}

const addAnotherEmailAddressClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Add another email address" link in Add Google Apps',
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_add_google_apps_add_another_email_address_click',
			{ domain_name: domainName }
		)
	);

const cancelClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Cancel" Button in Add Google Apps',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_add_google_apps_cancel_click', {
			domain_name: domainName,
		} )
	);

const continueClick = ( domainName, success, numberOfLicenses ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Continue" Button in Add Google Apps',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_add_google_apps_continue_click', {
			domain_name: domainName,
			number_of_licenses: numberOfLicenses,
			success,
		} )
	);

const domainChange = ( value, userIndex ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Changed "Domain" Input for User #${ userIndex } in Add Google Apps`,
			'Domain Name'
		),
		recordTracksEvent( 'calypso_domain_management_add_google_apps_domain_change', {
			user_index: userIndex,
			value,
		} )
	);

const inputFocus = ( domainName, fieldName, userIndex ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Focused On "${ fieldName }" Input for User #${ userIndex } in Add Google Apps`,
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			`calypso_domain_management_add_google_apps_${ snakeCase( fieldName ) }_focus`,
			{
				domain_name: domainName,
				user_index: userIndex,
			}
		)
	);

AddEmailAddressesCard.propTypes = {
	domains: PropTypes.array.isRequired,
	isRequestingSiteDomains: PropTypes.bool.isRequired,
	selectedDomainName: PropTypes.string,
};

export default connect(
	null,
	{
		addAnotherEmailAddressClick,
		cancelClick,
		continueClick,
		domainChange,
		inputFocus,
	}
)( localize( AddEmailAddressesCard ) );
