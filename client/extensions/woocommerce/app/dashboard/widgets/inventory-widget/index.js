/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { filter, sortBy } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
	areSettingsProductsLoaded,
	getProductsSettingValue,
} from 'woocommerce/state/sites/settings/products/selectors';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { fetchSettingsProducts } from 'woocommerce/state/sites/settings/products/actions';
import { getAllProducts } from 'woocommerce/state/sites/products/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import InventoryControls from './controls';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class InventoryWidget extends Component {
	static propTypes = {
		isLoaded: PropTypes.bool.isRequired,
		lowStockThreshold: PropTypes.number.isRequired,
		noStockThreshold: PropTypes.number.isRequired,
		products: PropTypes.array,
		shouldManageStock: PropTypes.bool.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		width: PropTypes.oneOf( [ 'half', 'full' ] ).isRequired,
	};

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchSettingsProducts( site.ID );
			// Get all products
			this.props.fetchProducts( site.ID, { offset: 0, per_page: 100 } );
		}
	}

	getLowStockProducts = () => {
		const { lowStockThreshold, products } = this.props;
		const lowProducts = filter(
			products,
			( p ) => parseInt( p.stock_quantity ) <= lowStockThreshold
		);
		return sortBy( lowProducts, 'stock_quantity' );
	};

	getClasses = () => {
		const { lowStockThreshold, noStockThreshold, products } = this.props;
		const lowProducts = filter(
			products,
			( p ) => parseInt( p.stock_quantity ) <= lowStockThreshold
		);
		const noProducts = filter(
			products,
			( p ) => parseInt( p.stock_quantity ) <= noStockThreshold
		);
		return classNames( {
			'dashboard-widgets__inventory': true,
			'has-low-stock': lowProducts.length > 0,
			'has-no-stock': noProducts.length > 0,
		} );
	};

	shouldShowImage = () => {
		const { width } = this.props;
		const lowProducts = this.getLowStockProducts();
		// Show the image on full-width, or if there are no products
		return 'full' === width || ! lowProducts.length;
	};

	renderRow = ( p, i ) => {
		const { noStockThreshold, site, translate } = this.props;
		const outOfStock = parseInt( p.stock_quantity ) <= noStockThreshold;
		const classes = classNames( 'dashboard-widgets__row', { 'is-out-of-stock': outOfStock } );
		const link = getLink( `/store/product/:site/${ p.id }`, site );
		return (
			<TableRow key={ i } className={ classes }>
				<TableItem isTitle>
					<a href={ link }>{ p.name }</a>
				</TableItem>
				<TableItem>{ outOfStock ? translate( 'Out of stock' ) : p.stock_quantity }</TableItem>
			</TableRow>
		);
	};

	renderLowStock = ( lowProducts ) => {
		const { translate } = this.props;
		const titles = (
			<TableRow isHeader>
				<TableItem isHeader isTitle>
					{ translate( 'Product' ) }
				</TableItem>
				<TableItem isHeader isTitle>
					{ translate( 'Stock' ) }
				</TableItem>
			</TableRow>
		);
		return (
			<Table header={ titles } compact>
				{ lowProducts.map( this.renderRow ) }
			</Table>
		);
	};

	renderContents = () => {
		const { translate } = this.props;
		const lowProducts = this.getLowStockProducts();
		if ( ! lowProducts.length ) {
			return (
				<p className="inventory-widget__message-ok">
					{ translate(
						'{{strong}}Looking good!{{/strong}} None of your products are currently at low stock levels.',
						{ components: { strong: <strong /> } }
					) }
				</p>
			);
		}
		return (
			<Fragment>
				<p className="inventory-widget__message-low">
					{ translate( 'Some of your products are running low on inventory.' ) }
				</p>
				{ this.renderLowStock( lowProducts ) }
			</Fragment>
		);
	};

	render() {
		const { products, shouldManageStock, translate } = this.props;
		if ( ! shouldManageStock || ! products.length ) {
			return null;
		}

		const props = {
			width: this.props.width,
			className: this.getClasses(),
			title: translate( 'Inventory alerts' ),
			settingsPanel: InventoryControls,
		};
		if ( this.shouldShowImage() ) {
			props.image = '/calypso/images/extensions/woocommerce/woocommerce-relaxed.svg';
			props.imagePosition = 'right';
		}

		return <DashboardWidget { ...props }>{ this.renderContents() }</DashboardWidget>;
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSiteWithFallback( state );
		const isLoaded = areSettingsProductsLoaded( state );
		const lowStockThreshold = parseInt(
			getProductsSettingValue( state, 'woocommerce_notify_low_stock_amount' ) || 0
		);
		const noStockThreshold = parseInt(
			getProductsSettingValue( state, 'woocommerce_notify_no_stock_amount' ) || 0
		);
		const shouldManageStock =
			'yes' === getProductsSettingValue( state, 'woocommerce_manage_stock' );
		const products = getAllProducts( state );

		return {
			isLoaded,
			lowStockThreshold,
			noStockThreshold,
			products,
			shouldManageStock,
			site,
		};
	},
	{
		fetchProducts,
		fetchSettingsProducts,
	}
)( localize( InventoryWidget ) );
