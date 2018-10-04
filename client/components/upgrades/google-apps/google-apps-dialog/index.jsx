/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import GoogleAppsUsers from './users';
import GoogleAppsProductDetails from './product-details';
import {
	validate as validateGappsUsers,
	filter as filterUsers,
} from 'lib/domains/google-apps-users';
import { getAnnualPrice, getMonthlyPrice, formatPrice } from 'lib/google-apps';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import QueryProducts from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';

class GoogleAppsDialog extends React.Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		productsList: PropTypes.object.isRequired,
		onAddGoogleApps: PropTypes.func.isRequired,
		onClickSkip: PropTypes.func.isRequired,
		onGoBack: PropTypes.func,
		analyticsSection: PropTypes.string,
		initialGoogleAppsCartItem: PropTypes.object,
		showDiscount: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		showDiscount: false,
	};

	state = {
		isAddingEmail: false,
		users: null,
		validationErrors: null,
	};

	UNSAFE_componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	}

	removeValidationErrors() {
		this.setState( { validationErrors: null } );
	}

	getPrices() {
		const { currencyCode, productsList } = this.props;
		const price = get( productsList, [ 'gapps', 'prices', currencyCode ], 0 );
		let prices = {
			annualPrice: getAnnualPrice( price, currencyCode ),
			monthlyPrice: getMonthlyPrice( price, currencyCode ),
		};

		if ( this.props.showDiscount ) {
			const discountRate = 50;
			const discountPrice = price * ( 1 - discountRate / 100 );
			prices = {
				...prices,
				monthlyPrice: formatPrice( price / 12, currencyCode, { precision: 1 } ),
				discountAnnualPrice: formatPrice( discountPrice, currencyCode ),
				discountMonthlyPrice: formatPrice( discountPrice / 12, currencyCode, { precision: 1 } ),
				discountRate,
			};
		}

		return prices;
	}

	render() {
		const prices = this.getPrices();

		return (
			<form className="google-apps-dialog" onSubmit={ this.handleFormSubmit }>
				<QueryProducts />
				<CompactCard>{ this.header() }</CompactCard>
				<CompactCard>
					<GoogleAppsProductDetails
						showDiscount={ this.props.showDiscount }
						domain={ this.props.domain }
						{ ...prices }
					/>
					<TransitionGroup>
						{ this.state.isAddingEmail && (
							<CSSTransition classNames="google-apps-dialog__users" timeout={ 200 }>
								{ this.renderGoogleAppsUsers() }
							</CSSTransition>
						) }
					</TransitionGroup>
				</CompactCard>
				<CompactCard>{ this.footer() }</CompactCard>
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
				onBlur={ this.save }
			/>
		);
	}

	setUsers = users => this.setState( { users: users } );

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
					{ translate( 'Add Professional email from G Suite by Google Cloud to %(domain)s', {
						args: {
							domain: this.props.domain,
						},
					} ) }
				</h2>
				<h5 className="google-apps-dialog__no-setup-required">
					{ translate( 'No setup or software required. Easy to manage from your dashboard.' ) }
				</h5>
			</header>
		);
	}

	footer() {
		const { translate, showDiscount } = this.props;
		const continueButtonHandler = this.state.isAddingEmail
			? this.handleFormSubmit
			: this.handleAddEmail;
		const continueButtonText = this.state.isAddingEmail
			? translate( 'Continue \u00BB' )
			: translate( 'Yes, Add Email \u00BB' );
		const skipText = showDiscount
			? // Do not translate this string as it is a part of an abtest.
			  "No thanks, I don't need email or I'll use another provider"
			: translate( 'Skip' );

		return (
			<footer className="google-apps-dialog__footer">
				{ ! this.state.isAddingEmail && (
					<Button
						className={ classnames( 'google-apps-dialog__checkout-button', {
							'with-discount': showDiscount,
						} ) }
						onClick={ this.handleFormCheckout }
						borderless={ this.props.showDiscount }
					>
						{ skipText }
					</Button>
				) }
				<Button
					primary
					className="google-apps-dialog__continue-button"
					onClick={ continueButtonHandler }
				>
					{ continueButtonText }
				</Button>
			</footer>
		);
	}

	handleAddEmail = event => {
		event.preventDefault();

		this.props.recordAddEmailButtonClick( this.props.analyticsSection );

		this.setState( { isAddingEmail: true } );
	};

	handleFormSubmit = event => {
		event.preventDefault();

		this.props.recordFormSubmit( this.props.analyticsSection );

		if ( ! this.validateForm() ) {
			return;
		}

		this.props.onAddGoogleApps( this.getGoogleAppsCartItem() );
	};

	handleFormCheckout = event => {
		event.preventDefault();

		this.props.recordCancelButtonClick( this.props.analyticsSection );

		this.props.onClickSkip();
	};

	handleFormKeepSearching = event => {
		event.preventDefault();

		this.props.recordKeepSearching();

		this.props.onGoBack();
	};

	getFields() {
		const { translate } = this.props;

		return {
			firstName: translate( 'First Name' ),
			lastName: translate( 'Last Name' ),
			email: translate( 'Email Address' ),
		};
	}

	validateForm() {
		const validation = validateGappsUsers( {
			users: this.state.users,
			fields: this.getFields(),
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
			fields: this.getFields(),
		} );

		users = users.map( user => {
			return {
				email: `${ user.email.value }@${ this.props.domain }`.toLowerCase(),
				firstname: user.firstName.value.trim(),
				lastname: user.lastName.value.trim(),
			};
		} );

		return cartItems.googleApps( {
			domain: this.props.domain,
			users,
		} );
	}
}

const recordKeepSearching = () =>
	recordGoogleEvent( 'Domain Search', 'Click "Keep Searching" Button in Google Apps Dialog' );

const recordCancelButtonClick = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_google_apps_cancel_button_click', { section } ),
		recordGoogleEvent( 'Domain Search', 'Clicked "Cancel" Button in Google Apps Dialog' )
	);

const recordAddEmailButtonClick = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_google_apps_add_email_button_click', { section } ),
		recordGoogleEvent( 'Domain Search', 'Clicked "Add Email" Button in Google Apps Dialog' )
	);

const recordFormSubmit = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_google_apps_form_submit', { section } ),
		recordGoogleEvent( 'Domain Search', 'Submitted Form in Google Apps Dialog' )
	);

export default connect(
	state => ( {
		currencyCode: getCurrentUserCurrencyCode( state ),
		productsList: getProductsList( state ),
	} ),
	{
		recordAddEmailButtonClick,
		recordCancelButtonClick,
		recordFormSubmit,
		recordKeepSearching,
	}
)( localize( GoogleAppsDialog ) );
