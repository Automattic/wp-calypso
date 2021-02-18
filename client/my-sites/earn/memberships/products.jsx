/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import './style.scss';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import HeaderCake from 'calypso/components/header-cake';
import SectionHeader from 'calypso/components/section-header';
import { Button, CompactCard } from '@automattic/components';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import Gridicon from 'calypso/components/gridicon';
import RecurringPaymentsPlanAddEditModal from './add-edit-plan-modal';
import RecurringPaymentsPlanDeleteModal from './delete-plan-modal';

class MembershipsProductsSection extends Component {
	state = {
		showAddEditDialog: false,
		showDeleteDialog: false,
		product: null,
	};

	renderEllipsisMenu( productId ) {
		return (
			<EllipsisMenu position="bottom left">
				<PopoverMenuItem onClick={ () => this.openAddEditDialog( productId ) }>
					<Gridicon size={ 18 } icon={ 'pencil' } />
					{ this.props.translate( 'Edit' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => this.openDeleteDialog( productId ) }>
					<Gridicon size={ 18 } icon={ 'trash' } />
					{ this.props.translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	openAddEditDialog = ( productId ) => {
		if ( productId ) {
			const product = this.props.products.find( ( prod ) => prod.ID === productId );
			this.setState( { showAddEditDialog: true, product } );
		} else {
			this.setState( { showAddEditDialog: true, product: null } );
		}
	};

	openDeleteDialog = ( productId ) => {
		if ( productId ) {
			const product = this.props.products.find( ( prod ) => prod.ID === productId );
			this.setState( { showDeleteDialog: true, product } );
		}
	};

	closeDialog = () => this.setState( { showAddEditDialog: false, showDeleteDialog: false } );

	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/payments/' + this.props.siteSlug }>
					{ this.props.translate( 'Payment plans' ) }
				</HeaderCake>

				<SectionHeader>
					<Button primary compact onClick={ () => this.openAddEditDialog( null ) }>
						{ this.props.translate( 'Add a new payment plan' ) }
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
				{ this.state.showAddEditDialog && (
					<RecurringPaymentsPlanAddEditModal
						closeDialog={ this.closeDialog }
						product={ this.state.product }
					/>
				) }
				{ this.state.showDeleteDialog && (
					<RecurringPaymentsPlanDeleteModal
						closeDialog={ this.closeDialog }
						product={ this.state.product }
					/>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		products: getProductsForSiteId( state, siteId ),
	};
} )( localize( MembershipsProductsSection ) );
