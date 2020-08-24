/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	areSetupChoicesLoading,
	getTriedCustomizerDuringInitialSetup,
	getCheckedTaxSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import { Checklist, Task } from 'components/checklist';
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
		const { site, productsLoaded } = this.props;

		if ( site && site.ID ) {
			this.props.fetchPaymentMethods( site.ID );

			if ( ! productsLoaded ) {
				this.props.fetchProducts( site.ID, { page: 1 } );
			}
		}
	};

	UNSAFE_componentWillReceiveProps = ( newProps ) => {
		const { site, productsLoaded } = this.props;

		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;

		if ( newSiteId && oldSiteId !== newSiteId ) {
			if ( ! productsLoaded ) {
				this.props.fetchProducts( newSiteId, { page: 1 } );
			}
		}
	};

	getClickHandler = ( id, url ) => () => {
		recordTrack( 'calypso_woocommerce_dashboard_action_click', {
			action: id,
		} );

		if ( 'view-and-customize' === id ) {
			this.props.setTriedCustomizerDuringInitialSetup( this.props.site.ID, true );
			window.open( url );
		} else {
			page.show( url );
		}
	};

	render = () => {
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
		return (
			<div className="setup__checklist">
				<QuerySettingsGeneral siteId={ this.props.site.ID } />
				<Checklist
					showChecklistHeader={ true }
					isPlaceholder={ this.props.loading || ! this.props.productsLoaded }
				>
					<Task
						onClick={ this.getClickHandler(
							'add-product',
							getLink( '/store/product/:site', site )
						) }
						title={ translate( 'Add a product' ) }
						buttonText={ translate( 'Add a product' ) }
						completedTitle={ translate( 'You have added a product' ) }
						completedButtonText={ translate( 'Add another product' ) }
						description={ translate( 'Start by adding the first product to your\u00a0store.' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						completed={ hasProducts }
					/>
					<Task
						onClick={ this.getClickHandler(
							'set-up-shipping',
							getLink( '/store/settings/shipping/:site', site )
						) }
						title={ translate( 'Review shipping' ) }
						buttonText={ translate( 'Review shipping' ) }
						completedTitle={ translate( 'Shipping is set up' ) }
						completedButtonText={ translate( 'View shipping' ) }
						description={ translate( "We've set up shipping based on your store location." ) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						completed={ shippingIsSetUp }
					/>
					<Task
						onClick={ this.getClickHandler(
							'set-up-payments',
							getLink( '/store/settings/payments/:site', site )
						) }
						title={ translate( 'Review payments' ) }
						buttonText={ translate( 'Review payments' ) }
						completedTitle={ translate( 'Payments are set up' ) }
						completedButtonText={ translate( 'Review payments' ) }
						description={ translate( 'Choose how you would like your customers to pay you.' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						completed={ paymentsAreSetUp }
					/>
					<Task
						onClick={ this.getClickHandler(
							'set-up-taxes',
							getLink( '/store/settings/taxes/:site', site )
						) }
						title={ translate( 'Review taxes' ) }
						buttonText={ translate( 'Review taxes' ) }
						completedTitle={ translate( 'Taxes are setup' ) }
						completedButtonText={ translate( 'Review taxes' ) }
						description={ translate( "We've set up automatic tax calculations for you." ) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						completed={ taxesAreSetUp }
					/>
					<Task
						onClick={ this.getClickHandler(
							'view-and-customize',
							getLink(
								'https://:site/wp-admin/customize.php?store-wpcom-nux=true&return=' + siteSlug,
								site
							)
						) }
						title={ translate( 'View and customize' ) }
						buttonText={ translate( 'Customize' ) }
						completedTitle={ translate( 'View and customize' ) }
						completedButtonText={ translate( 'View and customize' ) }
						description={ translate(
							'View your store and make any final tweaks before opening for business.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 4, args: [ 4 ] } ) }
						completed={ triedCustomizer }
					/>
				</Checklist>
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
