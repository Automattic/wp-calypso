/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';
import Notice from 'components/notice';

/**
 * Internal dependencies
 */
import './style.scss';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import { Button, CompactCard, Dialog } from '@automattic/components';
import QueryMembershipProducts from 'components/data/query-memberships';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import { requestDeleteProduct } from 'state/memberships/product-list/actions';
import RecurringPaymentsPlanAddEditModal from './add-edit-plan-modal';

class MembershipsProductsSection extends Component {
	state = {
		showDialog: false,
		product: null,
	};
	renderEllipsisMenu( productId ) {
		return (
			<EllipsisMenu position="bottom left">
				<PopoverMenuItem onClick={ () => this.openProductDialog( productId ) }>
					<Gridicon size={ 18 } icon={ 'pencil' } />
					{ this.props.translate( 'Edit' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => this.setState( { deletedProductId: productId } ) }>
					<Gridicon size={ 18 } icon={ 'trash' } />
					{ this.props.translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	openProductDialog = ( editedProductId ) => {
		if ( editedProductId ) {
			const product = this.props.products.find( ( prod ) => prod.ID === editedProductId );
			this.setState( { showDialog: true, product } );
		} else {
			this.setState( { showDialog: true, product: null } );
		}
	};

	onCloseDeleteProduct = ( reason ) => {
		if ( reason === 'delete' ) {
			const product = this.props.products
				.filter( ( p ) => p.ID === this.state.deletedProductId )
				.pop();
			this.props.requestDeleteProduct(
				this.props.siteId,
				product,
				this.props.translate( '"%s" was deleted.', { args: product.title } )
			);
		}
		this.setState( { deletedProductId: null } );
	};

	closeDialog = () => this.setState( { showDialog: false } );

	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/payments/' + this.props.siteSlug }>
					{ this.props.translate( 'Recurring Payments plans' ) }
				</HeaderCake>

				<SectionHeader>
					<Button primary compact onClick={ () => this.openProductDialog( null ) }>
						{ this.props.translate( 'Add new plan' ) }
					</Button>
				</SectionHeader>
				{ this.props.products.map( ( product ) => (
					<CompactCard className="memberships__products-product-card" key={ product.ID }>
						<div className="memberships__products-product-details">
							<div className="memberships__products-product-price">
								{ formatCurrency( product.price, product.currency ) }
							</div>
							<div className="memberships__products-product-title">{ product.title }</div>
						</div>

						{ this.renderEllipsisMenu( product.ID ) }
					</CompactCard>
				) ) }
				{ this.state.showDialog && (
					<RecurringPaymentsPlanAddEditModal
						closeDialog={ this.closeDialog }
						product={ this.state.product }
					/>
				) }
				<Dialog
					isVisible={ !! this.state.deletedProductId }
					buttons={ [
						{
							label: this.props.translate( 'Cancel' ),
							action: 'cancel',
						},
						{
							label: this.props.translate( 'Delete' ),
							isPrimary: true,
							action: 'delete',
						},
					] }
					onClose={ this.onCloseDeleteProduct }
				>
					<h1>{ this.props.translate( 'Confirmation' ) }</h1>
					<p>
						{ this.props.translate( 'Do you want to delete "%s"?', {
							args: get(
								this.props.products.filter( ( p ) => p.ID === this.state.deletedProductId ),
								[ 0, 'title' ],
								''
							),
						} ) }
					</p>
					<Notice
						text={ this.props.translate(
							'Deleting a product does not cancel the subscription for existing subscribers.{{br/}}They will continue to be charged even after you delete it.',
							{ components: { br: <br /> } }
						) }
						showDismiss={ false }
					/>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			products: get( state, [ 'memberships', 'productList', 'items', siteId ], [] ),
		};
	},
	{ requestDeleteProduct }
)( localize( MembershipsProductsSection ) );
