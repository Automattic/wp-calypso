/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import { getOrdersCurrentSearch } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import { ORDER_UNPAID, ORDER_UNFULFILLED, ORDER_COMPLETED } from 'woocommerce/lib/order-status';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import { updateCurrentOrdersQuery } from 'woocommerce/state/ui/orders/actions';

class OrdersFilterNav extends Component {
	doSearch = ( search ) => {
		this.props.updateCurrentOrdersQuery( this.props.site.ID, { search } );
	};

	clearSearch = () => {
		this.doSearch( '' );
	};

	render() {
		const { translate, site, status } = this.props;
		let currentSelection = translate( 'All orders' );
		if ( ORDER_UNPAID === status ) {
			currentSelection = translate( 'Awaiting payment' );
		} else if ( ORDER_UNFULFILLED === status ) {
			currentSelection = translate( 'Awaiting fulfillment' );
		} else if ( ORDER_COMPLETED === status ) {
			currentSelection = translate( 'Completed' );
		}

		return (
			<SectionNav selectedText={ currentSelection }>
				<NavTabs label={ translate( 'Status' ) } selectedText={ currentSelection }>
					<NavItem path={ getLink( '/store/orders/:site', site ) } selected={ 'any' === status }>
						{ translate( 'All orders' ) }
					</NavItem>
					<NavItem
						path={ getLink( `/store/orders/${ ORDER_UNPAID }/:site`, site ) }
						selected={ ORDER_UNPAID === status }
					>
						{ translate( 'Awaiting payment' ) }
					</NavItem>
					<NavItem
						path={ getLink( `/store/orders/${ ORDER_UNFULFILLED }/:site`, site ) }
						selected={ ORDER_UNFULFILLED === status }
					>
						{ translate( 'Awaiting fulfillment' ) }
					</NavItem>
					<NavItem
						path={ getLink( `/store/orders/${ ORDER_COMPLETED }/:site`, site ) }
						selected={ ORDER_COMPLETED === status }
					>
						{ translate( 'Completed' ) }
					</NavItem>
				</NavTabs>

				<Search
					ref={ this.props.searchRef }
					pinned
					fitsContainer
					onSearch={ this.doSearch }
					onSearchClose={ this.clearSearch }
					placeholder={ translate( 'Search orders' ) }
					analyticsGroup="Orders"
					delaySearch
				/>
			</SectionNav>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSiteWithFallback( state ),
		search: getOrdersCurrentSearch( state ),
	} ),
	( dispatch ) => bindActionCreators( { updateCurrentOrdersQuery }, dispatch )
)( localize( OrdersFilterNav ) );
