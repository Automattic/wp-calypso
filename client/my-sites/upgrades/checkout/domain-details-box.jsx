/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DomainDetailsForm from 'components/domains/domain-details-form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import analytics from 'lib/analytics';
import formState from 'lib/form-state';
import { addPrivacyToAllDomains, removePrivacyFromAllDomains } from 'lib/upgrades/actions';

class DomainDetailsBox extends Component {
	constructor( props, context ) {
		super( props, context );

		this.state = {
			isDialogVisible: false
		};
	}

	getNumberOfDomainRegistrations() {
		return cartItems.getDomainRegistrations( this.props.cart ).length;
	}

	allDomainRegistrationsHavePrivacy() {
		return cartItems.getDomainRegistrationsWithoutPrivacy( this.props.cart ).length === 0;
	}

	shouldRenderPrivacySection() {
		return cartItems.hasDomainRegistration( this.props.cart ) // && tld has optional privacy;
	}

	renderPrivacySection() {
		return (
			<PrivacyProtection
				cart={ this.props.cart }
				countriesList={ countriesList }
				disabled={ formState.isSubmitButtonDisabled( this.state.form ) }
				fields={ this.state.form }
				isChecked={ this.allDomainRegistrationsHavePrivacy() }
				onCheckboxChange={ this.handleCheckboxChange }
				onDialogClose={ this.closeDialog }
				onDialogOpen={ this.openDialog }
				onDialogSelect={ this.handlePrivacyDialogSelect }
				isDialogVisible={ this.state.isDialogVisible }
				productsList={ this.props.productsList } />
		);
	}

	handleCheckboxChange = () => {
		this.setPrivacyProtectionSubscriptions( ! this.allDomainRegistrationsHavePrivacy() );
	}

	closeDialog = () => {
		this.setState( { isDialogVisible: false } );
	}

	openDialog = () => {
		this.setState( { isDialogVisible: true } );
	}

	handlePrivacyDialogSelect = ( options ) => {
		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			if ( hasErrors || options.skipFinish ) {
				this.setPrivacyProtectionSubscriptions( options.addPrivacy !== false );
				this.closeDialog();
				return;
			}

			this.finish( options );
		} );
	}

	finish( options = {} ) {
		this.setPrivacyProtectionSubscriptions( options.addPrivacy !== false );

		const allFieldValues = Object.assign( {}, formState.getAllFieldValues( this.state.form ) );
		allFieldValues.phone = toIcannFormat( allFieldValues.phone, countries[ this.state.phoneCountryCode ] );
		setDomainDetails( allFieldValues );
		addGoogleAppsRegistrationData( allFieldValues );
	}

	setPrivacyProtectionSubscriptions( enable ) {
		if ( enable ) {
			addPrivacyToAllDomains();
		} else {
			removePrivacyFromAllDomains();
		}
	}

	render() {
		let title = this.props.translate( 'Domain Contact Information' );
		let DetailsForm = 'DomainDetailsForm';
		let classSet = classNames( {
			'domain-details': true,
			selected: true,
		} );

		if ( this.needsOnlyGoogleAppsDetails() ) {
			title = this.props.translate( 'G Suite Account Information' );
			DetailsForm = 'GoogleAppDetailsForm';
			classSet = classNames( {
				...classSet,
				'only-google-apps-details': true
			} );
		}

		return (
			<div>
				{ this.shouldRenderPrivacySection() && this.renderPrivacySection() }
				<PaymentBox classSet={ classSet } title={ title }>
					<DetailsForm />
				</PaymentBox>
			</div>
		);
	}
}

export default localize( DomainDetailsForm );
