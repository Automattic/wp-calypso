/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, groupBy, isEmpty, kebabCase, map, mapValues } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';
import page from 'page';

/**
 * Internal dependencies
 */
import AddAnotherUserLink from './add-another-user-link';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import { getEligibleDomain } from 'lib/domains/gsuite';
import getUserSetting from 'state/selectors/get-user-setting';
import { cartItems } from 'lib/cart-values';
import { emailManagement } from 'my-sites/email/paths';
import { addItem } from 'lib/upgrades/actions';
import { hasGoogleApps } from 'lib/domains';
import { filter as filterUsers, validate as validateUsers } from 'lib/domains/google-apps-users';
import QueryUserSettings from 'components/data/query-user-settings';
import NewUserForm from './new-user-form';

/**
 * Style dependencies
 */
import './add-users.scss';

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
		const { selectedDomainName } = this.props;
		return (
			<div className="gsuite-add-users__card">
				<QueryUserSettings />
				<Card className="gsuite-add-users__inner">
					<form className="gsuite-add-users__form">
						<FormLabel>{ this.props.translate( 'Add Email Addresses' ) }</FormLabel>
						{ this.renderFieldsets() }
						<AddAnotherUserLink addBlankUser={ this.addBlankUser } domain={ selectedDomainName } />
						{ this.formButtons() }
					</form>
				</Card>
			</div>
		);
	}

	renderFieldsets() {
		const { domains, isRequestingSiteDomains } = this.props;
		return this.state.fieldsets.map( ( fieldset, index ) => {
			return (
				<Fragment key={ index }>
					{ index > 0 && <hr /> }
					<NewUserForm
						domains={ domains }
						handleFieldChange={ this.handleFieldChange.bind( this, index ) }
						isRequestingSiteDomains={ isRequestingSiteDomains }
						user={ fieldset }
					/>
				</Fragment>
			);
		} );
	}

	handleFieldChange( index, fieldName, event ) {
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

	addBlankUser = () => {
		this.setState( {
			fieldsets: this.state.fieldsets.concat( [ this.getNewFieldset() ] ),
		} );
	};

	formButtons() {
		return (
			<FormFooter className="gsuite-add-users__footer">
				<FormButton
					onClick={ this.handleContinue }
					disabled={ this.props.isRequestingSiteDomains || ! this.props.gsuiteUsersLoaded }
				>
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

		const validation = validateUsers(
			{
				users: this.state.fieldsets,
				fields: this.getFields(),
			},
			this.props.gsuiteUsers
		);

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

	handleCancel = event => {
		event.preventDefault();

		this.props.cancelClick( this.props.selectedDomainName );

		page( emailManagement( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};
}

const cancelClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Cancel" Button in Add G Suite',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_add_gsuite_cancel_click', {
			domain_name: domainName,
		} )
	);

const continueClick = ( domainName, success, numberOfLicenses ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Continue" Button in Add G Suite',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_add_gsuite_continue_click', {
			domain_name: domainName,
			number_of_licenses: numberOfLicenses,
			success,
		} )
	);

const domainChange = ( value, userIndex ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Changed "Domain" Input for User #${ userIndex } in Add G Suite`,
			'Domain Name'
		),
		recordTracksEvent( 'calypso_domain_management_add_gsuite_domain_change', {
			user_index: userIndex,
			value,
		} )
	);

AddEmailAddressesCard.propTypes = {
	domains: PropTypes.array.isRequired,
	isRequestingSiteDomains: PropTypes.bool.isRequired,
	gsuiteUsers: PropTypes.array.isRequired,
	gsuiteUsersLoaded: PropTypes.bool.isRequired,
	selectedDomainName: PropTypes.string,
};

export default connect(
	state => ( {
		firstName: getUserSetting( state, 'first_name' ),
		lastName: getUserSetting( state, 'last_name' ),
	} ),
	{
		cancelClick,
		continueClick,
		domainChange,
	}
)( localize( AddEmailAddressesCard ) );
