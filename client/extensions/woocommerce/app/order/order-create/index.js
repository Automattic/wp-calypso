/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import Card from 'components/card';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import Main from 'components/main';
import OrderCustomerCard from './customer-card';
import ProductSearch from 'woocommerce/components/product-search';
import { ProtectFormGuard } from 'lib/protect-form';
import SectionHeader from 'components/section-header';

const noop = () => {};

class OrderCreate extends Component {
	editOrder = order => {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.editOrder( site.ID, order );
		}
	};

	render() {
		const { className, site, translate } = this.props;
		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>{ translate( 'New Order' ) }</span>,
		];
		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button primary>{ translate( 'Save Order' ) }</Button>
				</ActionHeader>
				<ProtectFormGuard isChanged={ false } />

				<div className="order-create__container">
					<SectionHeader label={ translate( 'Customer Details' ) } />
					<OrderCustomerCard siteId={ site && site.ID } editOrder={ this.editOrder } />

					<SectionHeader label={ translate( 'Add products to the order' ) } />
					<Card className="order-create__card">
						<ProductSearch onSelect={ noop } />
					</Card>

					<SectionHeader label={ translate( 'How will these products be shipped?' ) } />
					<Card className="order-create__card" />

					<SectionHeader label={ translate( 'How will the customer pay for the order?' ) }>
						<span>{ translate( 'Add coupon' ) }</span>
					</SectionHeader>
					<Card className="order-create__card" />
				</div>
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );

		return {
			site,
		};
	},
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderCreate ) );
