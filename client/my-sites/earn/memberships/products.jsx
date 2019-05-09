/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';
/**
 * Internal dependencies
 */
import './style.scss';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import QueryMembershipProducts from 'components/data/query-memberships';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import Dialog from 'components/dialog';

class MembershipsProductsSection extends Component {
	constructor() {
		super();
		this.onCloseDialog = this.onCloseDialog.bind( this );
	}
	state = {
		showDialog: false,
		editedProductId: null,
	};
	renderEllipsisMenu( productId ) {
		return (
			<EllipsisMenu position="bottom left">
				<PopoverMenuItem onClick={ () => this.openProductDialog( productId ) }>
					<Gridicon size={ 18 } icon={ 'pencil' } />
					{ this.props.translate( 'Edit' ) }
				</PopoverMenuItem>
				<PopoverMenuItem>
					<Gridicon size={ 18 } icon={ 'trash' } />
					{ this.props.translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	onCloseDialog = () => {
		this.setState( { showDialog: false, editedProductId: null } );
	};

	openProductDialog = editedProductId => {
		this.setState( { showDialog: true, editedProductId } );
	};

	renderEditDialog() {
		return (
			<Dialog
				isVisible={ this.state.showDialog }
				onClose={ this.onCloseDialog }
				buttons={ [
					{
						label: this.props.translate( 'Cancel' ),
						action: 'cancel',
						onCLick: this.onCloseDialog,
					},
					{
						label: this.state.editedProductId
							? this.props.translate( 'Edit' )
							: this.props.translate( 'Add' ),
						action: 'submit',
						onCLick: () => {},
					},
				] }
			>
				<h2>
					{ this.state.editedProductId && this.props.translate( 'Edit' ) }
					{ ! this.state.editedProductId && this.props.translate( 'Add New Membership Amount' ) }
				</h2>
				<p>
					{ this.props.translate(
						'You can add multiple membership amounts, each of which will allow you to generate a membership button.'
					) }
				</p>
			</Dialog>
		);
	}

	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/memberships/' + this.props.siteSlug }>
					{ this.props.translate( 'Membership Amounts' ) }
				</HeaderCake>
				{ this.renderEditDialog() }

				<SectionHeader>
					<Button primary compact onClick={ () => this.openProductDialog( null ) }>
						{ this.props.translate( 'Add new amount' ) }
					</Button>
				</SectionHeader>
				{ this.props.products.map( product => (
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
			</div>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			products: get( state, [ 'memberships', 'productList', 'items', siteId ], [] ),
		};
	},
	{}
)( localize( MembershipsProductsSection ) );
