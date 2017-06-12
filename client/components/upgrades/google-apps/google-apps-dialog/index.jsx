/**
 * External dependencies
 */
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import GoogleAppsUsers from './users';
import GoogleAppsProductDetails from './product-details';
import { abtest } from 'lib/abtest';
import { validate as validateGappsUsers, filter as filterUsers } from 'lib/domains/google-apps-users';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'state/analytics/actions';

class GoogleAppsDialog extends React.Component {
	static propTypes = {
		domain: React.PropTypes.string.isRequired,
		productsList: React.PropTypes.object.isRequired,
		onAddGoogleApps: React.PropTypes.func.isRequired,
		onClickSkip: React.PropTypes.func.isRequired,
		onGoBack: React.PropTypes.func,
		analyticsSection: React.PropTypes.string,
		initialGoogleAppsCartItem: React.PropTypes.object
	};

	state = {
		isAddingEmail: false,
		users: null,
		validationErrors: null
	};

	componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	}

	removeValidationErrors() {
		this.setState( { validationErrors: null } );
	}

	render() {
		const gapps = this.props.productsList && this.props.productsList.get().gapps;
		const price = gapps && gapps.cost_display;
		const monthlyPrice = getMonthlyPrice( price );
		const annualPrice = getAnnualPrice( price );

		return (
			<form className="google-apps-dialog" onSubmit={ this.handleFormSubmit }>
				<CompactCard>
					{ this.header() }
				</CompactCard>
				<CompactCard>
					<GoogleAppsProductDetails
						monthlyPrice={ monthlyPrice }
						annualPrice={ annualPrice }
					/>
					<ReactCSSTransitionGroup
						transitionName="google-apps-dialog__users"
						transitionEnterTimeout={ 200 }
						transitionLeaveTimeout={ 200 }>
						{ this.state.isAddingEmail && this.renderGoogleAppsUsers() }
					</ReactCSSTransitionGroup>
				</CompactCard>
				<CompactCard>
					{ this.footer() }
				</CompactCard>
			</form>
		);
	}

	renderGoogleAppsUsers() {
		return (
			<GoogleAppsUsers
				analyticsSection={ this.props.analyticsSection }
				fields={ this.state.users }
				domain={ this.props.domain }
				onChange={ this.setUsers }
				onBlur={ this.save } />
		);
	}

	setUsers = ( users ) => this.setState( { users: users } );

	save = () => {
		if ( this.props.onSave ) {
			this.props.onSave( this.state );
		}
	};

	header() {
		const { translate } = this.props;

		return (
			<header className="google-apps-dialog__header">
				<h2 className="google-apps-dialog__title">
					{
						translate(
							'Add Professional email from Google to %(domain)s',
							{
								args: {
									domain: this.props.domain
								}
							}
						)
					}
				</h2>
				<h5 className="google-apps-dialog__no-setup-required">
					{ translate( 'No setup or software required. Easy to manage from your dashboard.' ) }
				</h5>
			</header>
		);
	}

	maybeShowKeepSearching() {
		const { translate } = this.props;

		if ( abtest( 'multiDomainRegistrationV1' ) === 'singlePurchaseFlow' ) {
			return null;
		}
		return (
			<button
				className="google-apps-dialog__keepsearching-button button"
				href="#"
				onClick={ this.handleFormKeepSearching }>
				{ translate( 'Keep Searching' ) }
			</button>
		);
	}

	checkoutButtonOrLink() {
		const { translate } = this.props;

		if ( abtest( 'multiDomainRegistrationV1' ) === 'singlePurchaseFlow' ) {
			return (
				<a
					className="google-apps-dialog__cancel-link"
					href="#"
					onClick={ this.handleFormCheckout }>
					{ translate( "No thanks, I don't need email or will use another provider." ) }
				</a>
			);
		}

		return (
			<button className="google-apps-dialog__checkout-button button"
							href="#"
							onClick={ this.handleFormCheckout }>
				{ translate( 'Checkout' ) }
			</button>
		);
	}

	footer() {
		const { translate } = this.props;
		const continueButtonHandler = this.state.isAddingEmail ? this.handleFormSubmit : this.handleAddEmail;
		const continueButtonText = this.state.isAddingEmail
			? translate( 'Continue \u00BB' )
			: translate( 'Yes, Add Email \u00BB' );

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
	}

	handleAddEmail = ( event ) => {
		event.preventDefault();

		this.props.recordAddEmailButtonClick( this.props.analyticsSection );

		this.setState( { isAddingEmail: true } );
	};

	handleFormSubmit = ( event ) => {
		event.preventDefault();

		this.props.recordFormSubmit( this.props.analyticsSection );

		if ( ! this.validateForm() ) {
			return;
		}

		this.props.onAddGoogleApps( this.getGoogleAppsCartItem() );
	};

	handleFormCheckout = ( event ) => {
		event.preventDefault();

		this.props.recordCancelButtonClick( this.props.analyticsSection );

		this.props.onClickSkip();
	};

	handleFormKeepSearching = ( event ) => {
		event.preventDefault();

		this.props.recordKeepSearching();

		this.props.onGoBack();
	};

	getFields() {
		const { translate } = this.props;

		return {
			firstName: translate( 'First Name' ),
			lastName: translate( 'Last Name' ),
			email: translate( 'Email Address' )
		};
	}

	validateForm() {
		const validation = validateGappsUsers( {
			users: this.state.users,
			fields: this.getFields()
		} );

		if ( validation.errors.length > 0 ) {
			this.setState( { validationErrors: validation.errors } );
			this.setUsers( validation.users );
			return false;
		}
		return true;
	}

	getGoogleAppsCartItem() {
		let users = filterUsers( {
			users: this.state.users,
			fields: this.getFields()
		} );

		users = users.map( ( user ) => {
			return {
				email: `${ user.email.value }@${ this.props.domain }`.toLowerCase(),
				firstname: user.firstName.value.trim(),
				lastname: user.lastName.value.trim()
			};
		} );

		return cartItems.googleApps( {
			domain: this.props.domain,
			users
		} );
	}
}

const recordKeepSearching = () => recordGoogleEvent(
	'Domain Search',
	'Click "Keep Searching" Button in Google Apps Dialog'
);

const recordCancelButtonClick = ( section ) => composeAnalytics(
	recordTracksEvent(
		'calypso_google_apps_cancel_button_click',
		{ section }
	),
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Cancel" Button in Google Apps Dialog'
	)
);

const recordAddEmailButtonClick = ( section ) => composeAnalytics(
	recordTracksEvent(
		'calypso_google_apps_add_email_button_click',
		{ section }
	),
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Add Email" Button in Google Apps Dialog'
	)
);

const recordFormSubmit = ( section ) => composeAnalytics(
	recordTracksEvent(
		'calypso_google_apps_form_submit',
		{ section }
	),
	recordGoogleEvent(
		'Domain Search',
		'Submitted Form in Google Apps Dialog'
	)
);

export default connect(
	null,
	{
		recordAddEmailButtonClick,
		recordCancelButtonClick,
		recordFormSubmit,
		recordKeepSearching,
	}
)( localize( GoogleAppsDialog ) );
