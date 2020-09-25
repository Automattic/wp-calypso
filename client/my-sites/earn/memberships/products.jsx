/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import './style.scss';
import { addQueryArgs } from 'lib/route';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getProductsForSiteId } from 'state/memberships/product-list/selectors';
import HeaderCake from 'components/header-cake';
import Pagination from 'components/pagination';
import QueryPostCounts from 'components/data/query-post-counts';
import SectionHeader from 'components/section-header';
import { Button, CompactCard } from '@automattic/components';
import QueryMembershipProducts from 'components/data/query-memberships';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import { getAllPostCount } from 'state/posts/counts/selectors';

import RecurringPaymentsPlanAddEditModal from './add-edit-plan-modal';
import RecurringPaymentsPlanDeleteModal from './delete-plan-modal';
import { PAYMENT_PLANS_PER_PAGE } from './constants';
class MembershipsProductsSection extends Component {
	state = {
		showAddEditDialog: false,
		showDeleteDialog: false,
		product: null,
	};

	getTotalPages = () => Math.ceil( this.props.plansCount / PAYMENT_PLANS_PER_PAGE );

	isRequestedPageValid = () => this.getTotalPages() >= this.props.query.page;

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

	changePage = ( pageNumber ) => {
		if ( window ) {
			window.scrollTo( 0, 0 );
		}

		return page( addQueryArgs( { page: pageNumber }, this.props.path ) );
	};

	closeDialog = () => this.setState( { showAddEditDialog: false, showDeleteDialog: false } );

	render() {
		const { query, siteId, siteSlug, products, plansCount, translate } = this.props;
		const validPage = this.isRequestedPageValid() ? parseInt( query.page ) : 1;
		return (
			<div className="memberships__products">
				<QueryPostCounts siteId={ siteId } type="jp_mem_plan" />
				<QueryMembershipProducts siteId={ siteId } page={ validPage } />
				<HeaderCake backHref={ '/earn/payments/' + siteSlug }>
					{ translate( 'Payment plans' ) }
				</HeaderCake>
				<SectionHeader>
					<Button primary compact onClick={ () => this.openAddEditDialog( null ) }>
						{ translate( 'Add a new payment plan' ) }
					</Button>
				</SectionHeader>
				{ products.map( ( product ) => (
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
				<Pagination
					key="payment-plan-pagination"
					page={ validPage }
					pageClick={ this.changePage }
					perPage={ PAYMENT_PLANS_PER_PAGE }
					total={ plansCount }
				/>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	// this is not the right count for membership product list
	const plansCount = getAllPostCount( state, siteId, 'jp_mem_plan', 'publish' );

	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		products: getProductsForSiteId( state, siteId ),
		plansCount,
	};
} )( localize( MembershipsProductsSection ) );
