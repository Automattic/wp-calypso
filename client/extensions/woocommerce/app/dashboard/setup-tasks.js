/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	areSetupChoicesLoading,
	getOptedOutOfShippingSetup,
	getTriedCustomizerDuringInitialSetup,
	getCheckedTaxSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import {
	getTotalProducts,
	areProductsLoaded,
} from 'woocommerce/state/sites/products/selectors';
import {
	fetchProducts
} from 'woocommerce/state/sites/products/actions';
import {
	fetchPaymentMethods,
} from 'woocommerce/state/sites/payment-methods/actions';
import {
	fetchSetupChoices,
	setOptedOutOfShippingSetup,
	setTriedCustomizerDuringInitialSetup,
	setCheckedTaxSetup,
} from 'woocommerce/state/sites/setup-choices/actions';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import {
	arePaymentsSetup
} from 'woocommerce/state/ui/payments/methods/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import SetupTask from './setup-task';
import { areAnyShippingMethodsEnabled } from 'woocommerce/state/ui/shipping/zones/selectors';

class SetupTasks extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );
		this.state = {
			showShippingTask: props.loading || ! props.optedOutOfShippingSetup,
		};
	}

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchPaymentMethods( site.ID );
			this.props.fetchSetupChoices( site.ID );

			if ( ! areProductsLoaded ) {
				this.props.fetchProducts( site.ID, 1 );
			}
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;

		if ( newSiteId && ( oldSiteId !== newSiteId ) ) {
			this.props.fetchSetupChoices( newSiteId );
			if ( ! areProductsLoaded ) {
				this.props.fetchProducts( newSiteId, 1 );
			}
		}
	}

	onClickNoShip = ( event ) => {
		event.preventDefault();
		this.setState( {
			showShippingTask: false
		} );
		this.props.setOptedOutOfShippingSetup( this.props.site.ID, true );
	}

	onClickTaxSettings = () => {
		this.props.setCheckedTaxSetup( this.props.site.ID, true );
	}

	onClickOpenCustomizer = () => {
		this.props.setTriedCustomizerDuringInitialSetup( this.props.site.ID, true );
	}

	getSetupTasks = () => {
		const {
			site,
			triedCustomizer,
			hasProducts,
			paymentsAreSetUp,
			shippingIsSetUp,
			taxesAreSetUp,
			translate
		} = this.props;

		return [
			{
				checked: hasProducts,
				explanation: translate( 'Start by adding the first product to your\u00a0store.' ),
				label: translate( 'Add a product' ),
				show: true,
				actions: [
					{
						label: 'Add a product',
						path: getLink( '/store/product/:site', site ),
						analyticsProp: 'add-product',
					}
				]
			},
			{
				checked: shippingIsSetUp,
				explanation: translate( 'We\'ve set up shipping based on your store location.' ),
				label: translate( 'Review shipping' ),
				show: this.state.showShippingTask,
				actions: [
					{
						label: translate( 'Review shipping' ),
						path: getLink( '/store/settings/shipping/:site', site ),
						analyticsProp: 'set-up-shipping',
					}
				]
			},
			{
				checked: paymentsAreSetUp,
				explanation: translate( 'Choose how you would like your customers to pay you.' ),
				label: translate( 'Set up payments' ),
				show: true,
				actions: [
					{
						label: translate( 'Set up payments' ),
						path: getLink( '/store/settings/payments/:site', site ),
						analyticsProp: 'set-up-payments',
					}
				]
			},
			{
				checked: taxesAreSetUp,
				explanation: translate( 'We\'ve set up automatic tax calculations for you.' ),
				label: translate( 'Review taxes' ),
				show: true,
				actions: [
					{
						label: translate( 'Review taxes' ),
						path: getLink( '/store/settings/taxes/:site', site ),
						onClick: this.onClickTaxSettings,
						analyticsProp: 'set-up-taxes',
					}
				]
			},
			{
				checked: triedCustomizer,
				explanation: translate( 'View your store and make any final tweaks before opening for business.' ),
				label: translate( 'View and customize' ),
				show: true,
				actions: [
					{
						label: translate( 'View and customize' ),
						path: getLink( 'https://:site/wp-admin/customize.php?return=' + encodeURIComponent( '//' + site.slug ), site ),
						onClick: this.onClickOpenCustomizer,
						analyticsProp: 'view-and-customize',
					}
				]
			}
		];
	}

	renderSetupTask = ( setupTask, index ) => {
		if ( ! setupTask.show ) {
			return null;
		}

		return (
			<SetupTask
				actions={ setupTask.actions }
				checked={ setupTask.checked }
				explanation={ setupTask.explanation }
				key={ index }
				label={ setupTask.label }
			/>
		);
	}

	render = () => {
		return (
			<div className="dashboard__setup-checklist">
				<QuerySettingsGeneral siteId={ this.props.site.ID } />
				{ this.getSetupTasks().map( this.renderSetupTask ) }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		loading: areSetupChoicesLoading( state ),
		optedOutOfShippingSetup: getOptedOutOfShippingSetup( state ),
		triedCustomizer: getTriedCustomizerDuringInitialSetup( state ),
		hasProducts: getTotalProducts( state ) > 0,
		productsLoaded: areProductsLoaded( state ),
		paymentsAreSetUp: arePaymentsSetup( state ),
		shippingIsSetUp: areAnyShippingMethodsEnabled( state ),
		taxesAreSetUp: getCheckedTaxSetup( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPaymentMethods,
			fetchProducts,
			fetchSetupChoices,
			setOptedOutOfShippingSetup,
			setCheckedTaxSetup,
			setTriedCustomizerDuringInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SetupTasks ) );
