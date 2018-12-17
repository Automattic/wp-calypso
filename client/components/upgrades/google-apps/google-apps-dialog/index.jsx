/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import GoogleAppsUsers from './users';
import GoogleAppsProductDetails from './product-details';
import { isGsuiteRestricted } from 'lib/domains';
import {
	validate as validateGappsUsers,
	filter as filterUsers,
} from 'lib/domains/google-apps-users';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
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
	};

	state = {
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

		return {
			annualPrice: getAnnualPrice( price, currencyCode ),
			monthlyPrice: getMonthlyPrice( price, currencyCode ),
		};
	}

	render() {
		if ( isGsuiteRestricted() ) {
			this.props.handleClickSkip();
		} else {
			return this.renderView();
		}
	}

	renderView() {
		const prices = this.getPrices();

		return (
			<form className="google-apps-dialog__form" onSubmit={ this.handleFormSubmit }>
				<QueryProducts />
				<CompactCard>{ this.header() }</CompactCard>
				<CompactCard>
					<GoogleAppsProductDetails domain={ this.props.domain } { ...prices } />
					{ this.renderGoogleAppsUsers() }
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
		const { translate } = this.props;
		return (
			<footer className="google-apps-dialog__footer">
				<Button className="google-apps-dialog__checkout-button" onClick={ this.handleFormCheckout }>
					{ translate( 'Skip' ) }
				</Button>

				<Button
					primary
					className="google-apps-dialog__continue-button"
					onClick={ this.handleFormSubmit }
				>
					{ translate( 'Yes, Add Email \u00BB' ) }
				</Button>
			</footer>
		);
	}

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
