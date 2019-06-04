/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { addItem } from 'lib/upgrades/actions';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import { getItemsForCart, newUsers, userIsReady } from 'lib/gsuite/new-users';
import { getSelectedSite } from 'state/ui/selectors';
import GoogleAppsProductDetails from './product-details';
import GSuiteNewUserList from 'components/gsuite/gsuite-new-user-list';
import { isGSuiteRestricted } from 'lib/gsuite';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import QueryProducts from 'components/data/query-products-list';
import { getProductCost } from 'state/products-list/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class GoogleAppsDialog extends React.Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		productsList: PropTypes.object.isRequired,
		onAddGoogleApps: PropTypes.func.isRequired,
		onClickSkip: PropTypes.func.isRequired,
		onGoBack: PropTypes.func,
		analyticsSection: PropTypes.string,
		initialGoogleAppsCartItem: PropTypes.object,
		planType: PropTypes.string.isRequired,
		selectedSite: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
		} ).isRequired,
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
						extraValidation={ user => user }
						selectedDomainName={ domain }
						onUsersChange={ this.onUsersChange }
						users={ users }
					>
						{ this.footer() }
					</GSuiteNewUserList>
				</CompactCard>
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
		const { users } = this.state;
		const canContinue = 0 < users.length && users.every( userIsReady );

		return (
			<footer className="gsuite-dialog__footer">
				<Button className="gsuite-dialog__checkout-button" onClick={ this.handleFormCheckout }>
					{ translate( 'Skip' ) }
				</Button>

				<Button
					primary
					className="gsuite-dialog__continue-button"
					disabled={ ! canContinue }
					onClick={ this.handleAddEmail }
				>
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

	handleAddEmail = () => {
		const { domain, planType, selectedSite } = this.props;
		const { users } = this.state;
		const canContinue = 0 < users.length && users.every( userIsReady );

		if ( canContinue ) {
			getItemsForCart(
				[ domain ],
				'business' === planType ? 'gapps_unlimited' : 'gapps',
				users
			).forEach( addItem );
			page( '/checkout/' + selectedSite.slug );
		}
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
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			gsuiteBasicCost: getProductCost( state, 'gapps' ),
			planType: ownProps.planType || 'basic',
			selectedSite,
		};
	},
	{
		recordAddEmailButtonClick,
		recordCancelButtonClick,
		recordFormSubmit,
	}
)( localize( GoogleAppsDialog ) );
