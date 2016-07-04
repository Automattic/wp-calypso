/**
 * External dependencies
 */
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import GoogleAppsUsers from './users';
import GoogleAppsProductDetails from './product-details';
import analyticsMixin from 'lib/mixins/analytics';
import { abtest } from 'lib/abtest';
import { validate as validateGappsUsers, filter as filterUsers } from 'lib/domains/google-apps-users';

const GoogleAppsDialog = React.createClass( {
	mixins: [ analyticsMixin( 'googleApps' ) ],

	propTypes: {
		domain: React.PropTypes.string.isRequired,
		productsList: React.PropTypes.object.isRequired,
		onAddGoogleApps: React.PropTypes.func.isRequired,
		onClickSkip: React.PropTypes.func.isRequired,
		onGoBack: React.PropTypes.func,
		analyticsSection: React.PropTypes.string,
		initialGoogleAppsCartItem: React.PropTypes.object
	},

	getInitialState() {
		return {
			isAddingEmail: false,
			users: null,
			validationErrors: null
		};
	},

	componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	},

	removeValidationErrors() {
		this.setState( { validationErrors: null } );
	},

	render() {
		const gapps = this.props.productsList && this.props.productsList.get().gapps;
		let price = gapps && gapps.cost_display;

		// Gapps price is stored annually but we'd like to show a monthly price
		price = price && price.replace( /(\d+\.?\d+)/, ( value ) => {
			const number = ( Math.round( parseFloat( value ) / 10 * 100 ) / 100 );
			return number % 1 === 0 ? number : number.toFixed( 2 );
		} );

		return (
			<form className="google-apps-dialog card" onSubmit={ this.handleFormSubmit }>
				{ this.header() }
				<GoogleAppsProductDetails
					price={ price }
				/>
				<ReactCSSTransitionGroup
					transitionName="google-apps-dialog__users"
					transitionEnterTimeout={ 200 }
					transitionLeaveTimeout={ 200 }>
					{ this.state.isAddingEmail && this.renderGoogleAppsUsers() }
				</ReactCSSTransitionGroup>
				{ this.footer() }
			</form>
		);
	},

	renderGoogleAppsUsers() {
		return (
			<GoogleAppsUsers
				analyticsSection={ this.props.analyticsSection }
				fields={ this.state.users }
				domain={ this.props.domain }
				onChange={ this.setUsers }
				onBlur={ this.save } />
		);
	},

	setUsers( users ) {
		this.setState( { users: users } );
	},

	save() {
		if ( this.props.onSave ) {
			this.props.onSave( this.state );
		}
	},

	header() {
		return (
			<header className="google-apps-dialog__header">
				<h2 className="google-apps-dialog__title">
					{ this.translate( 'Add Professional Email to %(domain)s', { args: { domain: this.props.domain } } ) }
				</h2>
				<h5 className="google-apps-dialog__no-setup-required">
					{ this.translate( 'No setup or software required, easy to manage from your dashboard' ) }
				</h5>
			</header>
		);
	},

	maybeShowKeepSearching() {
		if ( abtest( 'multiDomainRegistrationV1' ) === 'singlePurchaseFlow' ) {
			return null;
		}
		return (
			<button
				className="google-apps-dialog__keepsearching-button button"
				href="#"
				onClick={ this.handleFormKeepSearching }>
				{ this.translate( 'Keep Searching' ) }
			</button>
		);
	},

	checkoutButtonOrLink() {
		if ( abtest( 'multiDomainRegistrationV1' ) === 'singlePurchaseFlow' ) {
			return (
				<a
					className="google-apps-dialog__cancel-link"
					href="#"
					onClick={ this.handleFormCheckout }>
					{ this.translate( "No thanks, I don't need email or will use another provider." ) }
				</a>
			);
		}

		return (
			<button className="google-apps-dialog__checkout-button button"
							href="#"
							onClick={ this.handleFormCheckout }>
				{ this.translate( 'Checkout' ) }
			</button>
		);
	},

	footer() {
		const continueButtonHandler = this.state.isAddingEmail ? this.handleFormSubmit : this.handleAddEmail,
			continueButtonText = this.state.isAddingEmail
				? this.translate( 'Continue \u00BB' )
				: this.translate( 'Add Email \u00BB' );

		return (
			<footer className="google-apps-dialog__footer">
				{ this.maybeShowKeepSearching() }
				{ this.checkoutButtonOrLink() }
				<button className="google-apps-dialog__continue-button button is-primary"
								type="submit"
								onClick={ continueButtonHandler }>
					{ continueButtonText }
				</button>
			</footer>
		);
	},

	handleAddEmail( event ) {
		event.preventDefault();

		this.recordEvent( 'addEmailButtonClick', this.props.analyticsSection );

		this.setState( { isAddingEmail: true } );
	},

	handleFormSubmit( event ) {
		event.preventDefault();

		this.recordEvent( 'formSubmit', this.props.analyticsSection );

		if ( ! this.validateForm() ) {
			return;
		}

		this.props.onAddGoogleApps( this.getGoogleAppsCartItem() );
	},

	handleFormCheckout( event ) {
		event.preventDefault();

		this.recordEvent( 'cancelButtonClick', this.props.analyticsSection );

		this.props.onClickSkip();
	},

	handleFormKeepSearching( event ) {
		event.preventDefault();

		this.recordEvent( 'keepSearchingButtonClick' );

		this.props.onGoBack();
	},

	getFields() {
		return {
			firstName: this.translate( 'First Name' ),
			lastName: this.translate( 'Last Name' ),
			email: this.translate( 'Email Address' )
		};
	},

	validateForm() {
		const validation = validateGappsUsers( {
			users: this.state.users,
			fields: this.getFields(),
			domainSuffix: this.props.domain
		} );

		if ( validation.errors.length > 0 ) {
			this.setState( { validationErrors: validation.errors } );
			this.setUsers( validation.users );
			return false;
		}
		return true;
	},

	getGoogleAppsCartItem() {
		let users = filterUsers( {
			users: this.state.users,
			fields: this.getFields()
		} );

		users = users.map( ( user ) => {
			return {
				email: `${ user.email.value }@${ this.props.domain }`,
				firstname: user.firstName.value.trim(),
				lastname: user.lastName.value.trim()
			};
		} );

		return cartItems.googleApps( {
			domain: this.props.domain,
			users
		} );
	}
} );

export default GoogleAppsDialog;
