/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactCSSTransitionGroup = require( 'react-addons-css-transition-group' );

/**
 * Internal dependencies
 */
var cartValues = require( 'lib/cart-values' ),
	cartItems = cartValues.cartItems,
	GoogleAppsUsers = require( './users' ),
	GoogleAppsProductDetails = require( './product-details' ),
	analyticsMixin = require( 'lib/mixins/analytics' ),
	abtest = require( 'lib/abtest' ).abtest,
	googleAppsLibrary = require( 'lib/domains/google-apps-users' ),
	validateGappsUsers = googleAppsLibrary.validate,
	filterUsers = googleAppsLibrary.filter;

var GoogleAppsDialog = React.createClass( {
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

	getInitialState: function() {
		return {
			isAddingEmail: false,
			users: null,
			validationErrors: null
		};
	},

	componentWillMount: function() {
		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	},

	removeValidationErrors: function() {
		this.setState( { validationErrors: null } );
	},

	render: function() {
		var gapps = this.props.productsList && this.props.productsList.get().gapps,
			price = gapps && gapps.cost_display,
			googleAppsUsers;

		// Gapps price is stored annually but we'd like to show a monthly price
		price = price && price.replace( /(\d+\.?\d+)/, function( val ) {
			var number = ( Math.round( parseFloat( val ) / 10 * 100 ) / 100 );
			return number % 1 === 0 ? number : number.toFixed( 2 );
		} );

		if ( this.state.isAddingEmail ) {
			googleAppsUsers = (
				<GoogleAppsUsers
					analyticsSection={ this.props.analyticsSection }
					fields={ this.state.users }
					domain={ this.props.domain }
					onChange={ this.setUsers }
					onBlur={ this.save } />
			);
		}

		return (
			<form className="google-apps-dialog card" onSubmit={ this.handleFormSubmit }>
				{ this.header() }
				<GoogleAppsProductDetails
					price={ price }
				/>
				<ReactCSSTransitionGroup
					transitionName='google-apps-dialog__users'
					transitionEnterTimeout={ 200 }
					transitionLeaveTimeout={ 200 }>
					{ googleAppsUsers }
				</ReactCSSTransitionGroup>
				{ this.footer() }
			</form>
		);
	},

	setUsers: function( users ) {
		this.setState( { users: users } );
	},

	save: function() {
		if ( this.props.onSave ) {
			this.props.onSave( this.state );
		}
	},

	header: function() {
		var domain = this.props.domain;

		return (
			<header className="google-apps-dialog__header">
				<h2 className="google-apps-dialog__title">
					{ this.translate( 'Add Professional Email to %(domain)s', { args: { domain: domain } } ) }
				</h2>
				<h5 className="google-apps-dialog__no-setup-required">
					{ this.translate( 'No setup or software required, easy to manage from your dashboard' ) }
				</h5>
			</header>
		);
	},

	maybeShowKeepSearching: function() {
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

	checkoutButtonOrLink: function() {
		var component;

		if ( abtest( 'multiDomainRegistrationV1' ) === 'singlePurchaseFlow' ) {
			component = (
				<a
					className="google-apps-dialog__cancel-link"
					href="#"
					onClick={ this.handleFormCheckout }>
					{ this.translate( "No thanks, I don't need email or will use another provider." ) }
				</a>
			);
		} else {
			component = (
				<button className="google-apps-dialog__checkout-button button"
								href="#"
								onClick={ this.handleFormCheckout }>
					{ this.translate( 'Checkout' ) }
				</button>
			);
		}

		return component;
	},

	footer: function() {
		var continueButtonHandler = this.state.isAddingEmail ? this.handleFormSubmit : this.handleAddEmail,
			continueButtonText = this.state.isAddingEmail ?
				this.translate( 'Continue \u00BB' ) :
				this.translate( 'Add Email \u00BB' );

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

	handleAddEmail: function( event ) {
		event.preventDefault();

		this.recordEvent( 'addEmailButtonClick', this.props.analyticsSection );

		this.setState( { isAddingEmail: true } );
	},

	handleFormSubmit: function( event ) {
		event.preventDefault();

		this.recordEvent( 'formSubmit', this.props.analyticsSection );

		if ( ! this.validateForm() ) {
			return;
		}

		this.props.onAddGoogleApps( this.getGoogleAppsCartItem() );
	},

	handleFormCheckout: function( event ) {
		event.preventDefault();

		this.recordEvent( 'cancelButtonClick', this.props.analyticsSection );

		this.props.onClickSkip();
	},

	handleFormKeepSearching: function( event ) {
		event.preventDefault();

		this.recordEvent( 'keepSearchingButtonClick' );

		this.props.onGoBack();
	},

	getFields: function() {
		return {
			firstName: this.translate( 'First Name' ),
			lastName: this.translate( 'Last Name' ),
			email: this.translate( 'Email Address' )
		};
	},

	validateForm: function() {
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

	getGoogleAppsCartItem: function() {
		var users = filterUsers( {
			users: this.state.users,
			fields: this.getFields()
		} );

		users = users.map( function( user ) {
			return {
				email: `${ user.email.value }@${ this.props.domain }`,
				firstname: user.firstName.value,
				lastname: user.lastName.value
			};
		} );

		return cartItems.googleApps( {
			domain: this.props.domain,
			users: users
		} );
	}
} );

module.exports = GoogleAppsDialog;
