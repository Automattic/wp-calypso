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

class MembershipsProductsSection extends Component {
	renderEllipsisMenu() {
		return (
			<EllipsisMenu position="bottom left">
				<PopoverMenuItem>{ this.props.translate( 'Delete' ) }</PopoverMenuItem>
			</EllipsisMenu>
		);
	}
	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/memberships/' + this.props.siteSlug }>
					{ this.props.translate( 'Membership Amounts' ) }
				</HeaderCake>

				<SectionHeader>
					<Button primary compact>
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
