/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	areSetupChoicesLoading,
	getTriedCustomizerDuringInitialSetup,
	getCheckedTaxSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import Checklist from 'components/checklist';
import { getTotalProducts, areProductsLoaded } from 'woocommerce/state/sites/products/selectors';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { fetchPaymentMethods } from 'woocommerce/state/sites/payment-methods/actions';
import { setTriedCustomizerDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/actions';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import { arePaymentsSetup } from 'woocommerce/state/ui/payments/methods/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { recordTrack } from 'woocommerce/lib/analytics';
import { areAnyShippingMethodsEnabled } from 'woocommerce/state/ui/shipping/zones/selectors';

class SetupTasks extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchPaymentMethods( site.ID );

			if ( ! areProductsLoaded ) {
				this.props.fetchProducts( site.ID, { page: 1 } );
			}
		}
	};

	componentWillReceiveProps = newProps => {
		const { site } = this.props;

		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;

		if ( newSiteId && oldSiteId !== newSiteId ) {
			if ( ! areProductsLoaded ) {
				this.props.fetchProducts( newSiteId, { page: 1 } );
			}
		}
	};

	getSetupTasks = () => {
		const {
			site,
			triedCustomizer,
			hasProducts,
			paymentsAreSetUp,
			shippingIsSetUp,
			taxesAreSetUp,
			translate,
		} = this.props;
		const siteSlug = encodeURIComponent( '//' + site.slug );
		const customizerUrl = getLink(
			'https://:site/wp-admin/customize.php?store-wpcom-nux=true&return=' + siteSlug,
			site
		);

		return [
			{
				id: 'add-product',
				title: translate( 'Add a product' ),
				completedTitle: translate( 'You have added a product' ),
				completedButtonText: translate( 'View products' ),
				description: translate( 'Start by adding the first product to your\u00a0store.' ),
				duration: translate( '3 mins' ),
				url: getLink( '/store/product/:site', site ),
				completed: hasProducts,
			},
			{
				id: 'set-up-shipping',
				title: translate( 'Review shipping' ),
				completedTitle: translate( 'Shipping is set up' ),
				completedButtonText: translate( 'View shipping' ),
				description: translate( "We've set up shipping based on your store location." ),
				duration: translate( '2 mins' ),
				url: getLink( '/store/settings/shipping/:site', site ),
				completed: shippingIsSetUp,
			},
			{
				id: 'set-up-payments',
				title: translate( 'Review payments' ),
				completedTitle: translate( 'Payments are set up' ),
				completedButtonText: translate( 'Review payments' ),
				description: translate( 'Choose how you would like your customers to pay you.' ),
				duration: translate( '2 mins' ),
				url: getLink( '/store/settings/payments/:site', site ),
				completed: paymentsAreSetUp,
			},
			{
				id: 'set-up-taxes',
				title: translate( 'Review taxes' ),
				completedTitle: translate( 'Taxes are setup' ),
				completedButtonText: translate( 'Review taxes' ),
				description: translate( "We've set up automatic tax calculations for you." ),
				duration: translate( '2 mins' ),
				url: getLink( '/store/settings/taxes/:site', site ),
				completed: taxesAreSetUp,
			},
			{
				id: 'view-and-customize',
				title: translate( 'View and customize' ),
				completedTitle: translate( 'View and customize' ),
				completedButtonText: translate( 'View and customize' ),
				description: translate(
					'View your store and make any final tweaks before opening for business.'
				),
				duration: translate( '4 mins' ),
				url: customizerUrl,
				completed: triedCustomizer,
			},
		];
	};

	handleAction = id => {
		const task = find( this.getSetupTasks(), { id } );

		recordTrack( 'calypso_woocommerce_dashboard_action_click', {
			action: id,
		} );

		if ( 'view-and-customize' === id ) {
			this.props.setTriedCustomizerDuringInitialSetup( this.props.site.ID, true );
			window.open( task.url );
		} else {
			page.redirect( task.url );
		}
	};

	render = () => {
		return (
			<div className="setup__checklist">
				<QuerySettingsGeneral siteId={ this.props.site.ID } />
				<Checklist
					tasks={ this.getSetupTasks() }
					onAction={ this.handleAction }
					onToggle={ this.handleToggle }
					isLoading={ this.props.loading || ! this.props.productsLoaded }
					placeholderCount={ 5 }
				/>
			</div>
		);
	};
}

function mapStateToProps( state ) {
	return {
		loading: areSetupChoicesLoading( state ),
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
			setTriedCustomizerDuringInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SetupTasks ) );
