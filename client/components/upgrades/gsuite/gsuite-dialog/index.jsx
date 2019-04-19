/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import GoogleAppsProductDetails from './product-details';
import { isGSuiteRestricted } from 'lib/gsuite';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import QueryProducts from 'components/data/query-products-list';
import { getProductCost } from 'state/products-list/selectors';

/**
 * Style dependencies
 */
import './style.scss';

//TODO: Dev Hacks
import GSuiteNewUserList from 'components/gsuite/gsuite-new-user-list';
import { newUsers } from 'lib/gsuite/new-users';

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

	constructor( props ) {
		super( props );
		this.state = {
			productSlug: 'gapps',
			users: newUsers( props.domain ),
		};
	}

	onUsersChange = users => {
		this.setState( {
			users,
		} );
	};

	componentDidMount() {
		this.props.recordAddEmailButtonClick( this.props.analyticsSection );
	}

	render() {
		if ( isGSuiteRestricted() ) {
			this.props.handleClickSkip();
		} else {
			return this.renderView();
		}
	}

	renderView() {
		const { productSlug, users } = this.state;
		const { currencyCode, domain, gsuiteBasicCost } = this.props;
		return (
			<div className="gsuite-dialog__form">
				<QueryProducts />
				<CompactCard>{ this.header() }</CompactCard>
				<CompactCard>
					<GoogleAppsProductDetails
						domain={ domain }
						cost={ gsuiteBasicCost }
						currencyCode={ currencyCode }
						plan={ productSlug }
					/>
					<GSuiteNewUserList
						selectedDomainName={ domain }
						onUsersChange={ this.onUsersChange }
						users={ users }
					/>
				</CompactCard>
				<CompactCard>{ this.footer() }</CompactCard>
			</div>
		);
	}

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

				<Button primary className="gsuite-dialog__continue-button">
					{ this.renderButtonCopy() }
				</Button>
			</footer>
		);
	}

	handleFormCheckout = event => {
		event.preventDefault();

		this.props.recordCancelButtonClick( this.props.analyticsSection );

		this.props.onClickSkip();
	};
}

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
		gsuiteBasicCost: getProductCost( state, 'gapps' ),
	} ),
	{
		recordAddEmailButtonClick,
		recordCancelButtonClick,
		recordFormSubmit,
	}
)( localize( GoogleAppsDialog ) );
