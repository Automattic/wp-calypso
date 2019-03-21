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
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import GoogleAppsUsers from './users';
import GoogleAppsProductDetails from './product-details';
import { isGSuiteRestricted } from 'lib/domains/gsuite';
import {
	validate as validateGappsUsers,
	filter as filterUsers,
} from 'lib/domains/google-apps-users';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import QueryProducts from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';

const gsuitePlanSlug = 'gapps'; // or gapps_unlimited - TODO make this dynamic

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

	componentDidMount() {
		this.props.recordAddEmailButtonClick( this.props.analyticsSection );
	}

	UNSAFE_componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	}

	getPrices( plan ) {
		const { currencyCode, productsList } = this.props;
		const price = get( productsList, [ plan, 'prices', currencyCode ], 0 );

		return {
			annualPrice: getAnnualPrice( price, currencyCode ),
			monthlyPrice: getMonthlyPrice( price, currencyCode ),
		};
	}

	render() {
		if ( isGSuiteRestricted() ) {
			this.props.handleClickSkip();
		} else {
			return this.renderView();
		}
	}

	renderView() {
		const prices = this.getPrices( gsuitePlanSlug );

		return (
			<form className="gsuite-dialog__form" onSubmit={ this.handleFormSubmit }>
				<QueryProducts />
				<CompactCard>{ this.header() }</CompactCard>
				<CompactCard>
					<GoogleAppsProductDetails
						domain={ this.props.domain }
						plan={ gsuitePlanSlug }
						{ ...prices }
					/>
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
			<header className="gsuite-dialog__header">
				<h2 className="gsuite-dialog__title">
					{ translate( 'Add Professional email from G Suite by Google Cloud to %(domain)s', {
						args: {
							domain: this.props.domain,
						},
					} ) }
				</h2>
				<h5 className="gsuite-dialog__no-setup-required">
					{ translate( 'No setup or software required. Easy to manage from your dashboard.' ) }
				</h5>
			</header>
		);
	}

	renderButtonCopy() {
		const { translate } = this.props;
		if ( abtest( 'gSuiteContinueButtonCopy' ) === 'purchase' ) {
			return translate( 'Purchase G Suite' );
		}
		return translate( 'Yes, Add Email \u00BB' );
	}

	footer() {
		const { translate } = this.props;

		return (
			<footer className="gsuite-dialog__footer">
				<Button className="gsuite-dialog__checkout-button" onClick={ this.handleFormCheckout }>
					{ translate( 'Skip' ) }
				</Button>

				<Button
					primary
					className="gsuite-dialog__continue-button"
					onClick={ this.handleFormSubmit }
				>
					{ this.renderButtonCopy() }
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
			product_slug: gsuitePlanSlug,
			users,
		} );
	}
}

const recordKeepSearching = () =>
	recordGoogleEvent( 'Domain Search', 'Click "Keep Searching" Button in G Suite Dialog' );

const recordCancelButtonClick = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_gsuite_cancel_button_click', { section } ),
		recordGoogleEvent( 'Domain Search', 'Clicked "Cancel" Button in G Suite Dialog' )
	);

const recordAddEmailButtonClick = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_gsuite_add_email_button_click', { section } ),
		recordGoogleEvent( 'Domain Search', 'Clicked "Add Email" Button in G Suite Dialog' )
	);

const recordFormSubmit = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_gsuite_form_submit', { section } ),
		recordGoogleEvent( 'Domain Search', 'Submitted Form in G Suite Dialog' )
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
