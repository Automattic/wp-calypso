/** @format */
/**
 * External dependencies
 */
import { find, groupBy, isEmpty, map, mapValues } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import update from 'immutability-helper';
import page from 'page';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
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

const AddEmailAddressesCard = createReactClass( {
	displayName: 'AddEmailAddressesCard',
	mixins: [ analyticsMixin( 'domainManagement', 'addGoogleApps' ) ],

	propTypes: {
		domains: PropTypes.object.isRequired,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string,
	},

	getInitialState() {
		return {
			fieldsets: [ this.getNewFieldset() ],
			validationErrors: null,
		};
	},

	getNewFieldset() {
		let domain;

		if ( this.props.selectedDomainName ) {
			domain = this.props.selectedDomainName;
		} else if ( this.props.isRequestingSiteDomains ) {
			domain = this.getFirstDomainName();
		} else {
			domain = null;
		}

		return {
			username: { value: '' },
			domain: { value: domain },
		};
	},

	removeValidationErrors: function() {
		this.setState( { validationErrors: null } );
	},

	validationErrors: function() {
		if ( this.state.validationErrors ) {
			return (
				<Notice onDismissClick={ this.removeValidationErrors } status="is-error">
					<ValidationErrorList messages={ this.state.validationErrors } />
				</Notice>
			);
		}
	},

	componentDidUpdate( prevProps ) {
		if ( this.needsToUpdateDomainFields( prevProps ) ) {
			this.setDomainFieldsToFirstDomainName();
		}
	},

	needsToUpdateDomainFields( prevProps ) {
		return (
			! this.props.selectedDomainName &&
			! prevProps.isRequestingSiteDomains &&
			this.props.isRequestingSiteDomains
		);
	},

	getFirstDomainName() {
		const domains = getGoogleAppsSupportedDomains( this.props.domains );
		return domains[ 0 ].name;
	},

	setDomainFieldsToFirstDomainName() {
		const firstDomainName = this.getFirstDomainName(),
			nextFieldsets = this.state.fieldsets.map( fieldset => {
				return update( fieldset, {
					domain: { value: { $set: firstDomainName } },
				} );
			} );

		this.setState( { fieldsets: nextFieldsets } );
	},

	render() {
		return (
			<div className="add-email-addresses-card">
				{ this.validationErrors() }

				<Card className="add-email-addresses-card__inner">
					<form className="add-email-addresses-card__form">
						<FormLabel>{ this.props.translate( 'Add Email Addresses' ) }</FormLabel>

						{ this.allEmailAddressFieldsets() }
						{ this.addAnotherEmailAddressLink() }
						{ this.formButtons() }
					</form>
				</Card>
			</div>
		);
	},

	allEmailAddressFieldsets() {
		return (
			<div className="add-email-addresses-card__email-address-fieldsets">
				{ this.state.fieldsets.map( ( _, index ) => this.emailAddressFieldset( index ) ) }
			</div>
		);
	},

	emailAddressFieldset( index ) {
		const field = this.state.fieldsets[ index ],
			contactText = this.props.translate( 'contact', {
				context: 'part of e-mail address',
				comment: 'As it would be part of an e-mail address contact@example.com',
			} );
		let suffix, select;

		if ( this.props.selectedDomainName ) {
			suffix = '@' + field.domain.value;
		} else {
			select = (
				<DomainsSelect
					domains={ this.props.domains }
					isRequestingSiteDomains={ this.props.isRequestingSiteDomains }
					value={ this.state.fieldsets[ index ].domain.value }
					onChange={ this.handleFieldChange.bind( this, 'domain', index ) }
					onFocus={ this.handleFieldFocus.bind( this, 'Domain', index ) }
				/>
			);
		}

		return (
			<div className="add-email-addresses-card__email-address-fieldset" key={ index }>
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
	},

	handleFieldChange( fieldName, index, event ) {
		const newValue = event.target.value;
		const command = { fieldsets: {} };

		command.fieldsets[ index ] = {};
		command.fieldsets[ index ][ fieldName ] = { value: { $set: newValue.trim() } };

		if ( fieldName === 'domain' ) {
			this.recordEvent( 'domainChange', newValue, index );
		}

		this.setState( update( this.state, command ) );
	},

	handleFieldFocus( fieldName, index ) {
		this.recordEvent( 'inputFocus', this.props.selectedDomainName, fieldName, index );
	},

	addAnotherEmailAddressLink() {
		return (
			<a
				className="add-email-addresses-card__add-another-email-address-link"
				href="#"
				onClick={ this.handleAddAnotherEmailAddress }
			>
				{ this.props.translate( '+ Add another email address' ) }
			</a>
		);
	},

	handleAddAnotherEmailAddress( event ) {
		event.preventDefault();

		this.setState( {
			fieldsets: this.state.fieldsets.concat( [ this.getNewFieldset() ] ),
		} );

		this.recordEvent( 'addAnotherEmailAddressClick', this.props.selectedDomainName );
	},

	formButtons() {
		return (
			<FormFooter className="add-email-addresses-card__footer">
				<FormButton
					onClick={ this.handleContinue }
					disabled={ ! this.props.isRequestingSiteDomains }
				>
					{ this.props.translate( 'Continue' ) }
				</FormButton>

				<FormButton
					type="button"
					isPrimary={ false }
					onClick={ this.handleCancel }
					disabled={ ! this.props.isRequestingSiteDomains }
				>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>
			</FormFooter>
		);
	},

	getFields() {
		return { username: this.props.translate( 'User Name' ) };
	},

	handleContinue( event ) {
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

		this.recordEvent(
			'continueClick',
			this.props.selectedDomainName,
			isEmpty( validation.errors ),
			validation.users.length
		);

		if ( isEmpty( validation.errors ) ) {
			this.addProductsAndGoToCheckout();
		}
	},

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
	},

	handleCancel( event ) {
		event.preventDefault();

		this.recordEvent( 'cancelClick', this.props.selectedDomainName );

		page( domainManagementEmail( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	},
} );

function getGoogleAppsCartItems( { domains, fieldsets } ) {
	let groups = groupBy( fieldsets, function( fieldset ) {
		return fieldset.domain.value;
	} );

	groups = mapValues( groups, function( group ) {
		return map( group, function( fieldset ) {
			return {
				email: `${ fieldset.username.value }@${ fieldset.domain.value }`.toLowerCase(),
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

export default localize( AddEmailAddressesCard );
