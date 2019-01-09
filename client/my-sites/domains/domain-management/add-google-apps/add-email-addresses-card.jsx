/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { has, find, groupBy, isEmpty, kebabCase, map, mapValues, snakeCase } from 'lodash';
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
import FormInputValidation from 'components/forms/form-input-validation';
import { getEligibleDomain } from 'lib/domains/gsuite';
import getUserSetting from 'state/selectors/get-user-setting';
import { cartItems } from 'lib/cart-values';
import { domainManagementEmail } from 'my-sites/domains/paths';
import { addItem } from 'lib/upgrades/actions';
import { hasGoogleApps, getGoogleAppsSupportedDomains } from 'lib/domains';
import { filter as filterUsers, validate as validateUsers } from 'lib/domains/google-apps-users';
import DomainsSelect from './domains-select';
import QueryUserSettings from 'components/data/query-user-settings';

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
			fieldsets: [ this.getNewFieldset() ],
		};
	}

	static getDerivedStateFromProps( props, state ) {
		// Retrieves information from the first additional user
		const [
			{
				firstName: { value: firstName },
				lastName: { value: lastName },
				wasUserEdited,
			},
		] = state.fieldsets;

		if ( wasUserEdited ) {
			return null;
		}

		if ( props.firstName === null || props.lastName === null ) {
			return null;
		}

		if ( props.firstName === firstName && props.lastName === lastName ) {
			return null;
		}

		// Updates information of the first additional user with the current user settings data
		const fieldsets = state.fieldsets.map( ( fieldset, index ) => {
			if ( index !== 0 ) {
				return fieldset;
			}

			return {
				...fieldset,
				firstName: { value: props.firstName },
				lastName: { value: props.lastName },
				username: { value: kebabCase( props.firstName ) },
			};
		} );

		return {
			...state,
			fieldsets,
		};
	}

	getNewFieldset() {
		const { selectedDomainName, domains } = this.props;
		const domain = getEligibleDomain( selectedDomainName, domains );
		return {
			username: { value: '' },
			domain: { value: domain },
			firstName: { value: '' },
			lastName: { value: '' },
			wasUserEdited: false,
		};
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

	setDomainFieldsToFirstDomainName() {
		const { selectedDomainName, domains } = this.props;
		const domain = getEligibleDomain( selectedDomainName, domains );
		const nextFieldsets = this.state.fieldsets.map( fieldset => {
			return update( fieldset, {
				domain: { value: { $set: domain } },
			} );
		} );

		this.setState( { fieldsets: nextFieldsets } );
	}

	render() {
		return (
			<div className="add-google-apps__card">
				<QueryUserSettings />
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
		return this.state.fieldsets.map( ( fields, index ) => {
			return (
				<Fragment key={ index }>
					{ index > 0 && <hr /> }
					<div className="add-google-apps__email-address-fieldsets">
						{ this.emailAddressFieldset( index, fields.username, fields.domain ) }
					</div>
					<div className="add-google-apps__name-fieldsets">
						{ this.renderNameFieldset( index, fields.firstName, fields.lastName ) }
					</div>
				</Fragment>
			);
		} );
	}

	renderNameFieldset( index, firstName, lastName ) {
		const { translate } = this.props;

		return (
			<Fragment key={ index }>
				<FormFieldset>
					<FormTextInput
						placeholder={ translate( 'First Name' ) }
						name="firstName"
						maxLength={ 60 }
						onChange={ this.handleFieldChange.bind( this, 'firstName', index ) }
						value={ firstName.value }
						isError={ has( firstName, 'error' ) && null !== firstName.error }
					/>
					<FormInputValidation
						isHidden={ ! has( firstName, 'error' ) || null === firstName.error }
						isError={ has( firstName, 'error' ) && null !== firstName.error }
						text={ firstName.error || '\u00A0' }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormTextInput
						placeholder={ translate( 'Last Name' ) }
						name="lastName"
						maxLength={ 60 }
						onChange={ this.handleFieldChange.bind( this, 'lastName', index ) }
						value={ lastName.value }
						isError={ has( lastName, 'error' ) && null !== lastName.error }
					/>
					<FormInputValidation
						isHidden={ ! has( lastName, 'error' ) || null === lastName.error }
						isError={ has( lastName, 'error' ) && null !== lastName.error }
						text={ lastName.error || '\u00A0' }
					/>
				</FormFieldset>
			</Fragment>
		);
	}

	emailAddressFieldset( index, username, domain ) {
		const contactText = this.props.translate( 'contact', {
			context: 'part of e-mail address',
			comment: 'As it would be part of an e-mail address contact@example.com',
		} );

		const isError =
			( has( username, 'error' ) && null !== username.error ) ||
			( has( domain, 'error' ) && null !== domain.error );
		const errorMessage = isError ? username.error || domain.error : '\u00A0';

		return (
			<div className="add-google-apps__email-address-fieldset" key={ index }>
				<div>
					<FormTextInput
						onChange={ this.handleFieldChange.bind( this, 'username', index ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Email', index ) }
						placeholder={ this.props.translate( 'e.g. %(example)s', {
							args: { example: contactText },
						} ) }
						type="text"
						value={ username.value }
						isError={ isError }
					/>
					<DomainsSelect
						domains={ getGoogleAppsSupportedDomains( this.props.domains ) }
						isRequestingSiteDomains={ this.props.isRequestingSiteDomains }
						value={ domain.value }
						onChange={ this.handleFieldChange.bind( this, 'domain', index ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Domain', index ) }
						isError={ isError }
					/>
				</div>
				<FormInputValidation isHidden={ ! isError } isError={ true } text={ errorMessage } />
			</div>
		);
	}

	handleFieldChange( fieldName, index, event ) {
		const newValue = event.target.value;
		const command = { fieldsets: {} };

		command.fieldsets[ index ] = {};
		command.fieldsets[ index ][ fieldName ] = { value: { $set: newValue.trim() } };
		command.fieldsets[ index ].wasUserEdited = { $set: true };

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
				type="button"
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
			fieldsets: this.state.fieldsets.concat( [ this.getNewFieldset() ] ),
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
	state => ( {
		firstName: getUserSetting( state, 'first_name' ),
		lastName: getUserSetting( state, 'last_name' ),
	} ),
	{
		addAnotherEmailAddressClick,
		cancelClick,
		continueClick,
		domainChange,
		inputFocus,
	}
)( localize( AddEmailAddressesCard ) );
