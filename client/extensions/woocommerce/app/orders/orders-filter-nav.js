/** @format */
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
import { getLink } from 'client/extensions/woocommerce/lib/nav-utils';
import { getOrdersCurrentSearch } from 'client/extensions/woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import NavItem from 'client/components/section-nav/item';
import NavTabs from 'client/components/section-nav/tabs';
import {
	ORDER_UNPAID,
	ORDER_UNFULFILLED,
	ORDER_COMPLETED,
} from 'client/extensions/woocommerce/lib/order-status';
import Search from 'client/components/search';
import SectionNav from 'client/components/section-nav';
import { updateCurrentOrdersQuery } from 'client/extensions/woocommerce/state/ui/orders/actions';

class OrdersFilterNav extends Component {
	doSearch = search => {
		this.props.updateCurrentOrdersQuery( this.props.site.ID, { search } );
	};

	clearSearch = () => {
		this.doSearch( '' );
	};

	render() {
		const { translate, site, status } = this.props;
		let currentSelection = translate( 'All Orders' );
		if ( ORDER_UNPAID === status ) {
			currentSelection = translate( 'Awaiting Payment' );
		} else if ( ORDER_UNFULFILLED === status ) {
			currentSelection = translate( 'Awaiting Fulfillment' );
		} else if ( ORDER_COMPLETED === status ) {
			currentSelection = translate( 'Completed' );
		}

		return (
			<SectionNav selectedText={ currentSelection }>
				<NavTabs label={ translate( 'Status' ) } selectedText={ currentSelection }>
					<NavItem path={ getLink( '/store/orders/:site', site ) } selected={ 'any' === status }>
						{ translate( 'All Orders' ) }
					</NavItem>
					<NavItem
						path={ getLink( `/store/orders/${ ORDER_UNPAID }/:site`, site ) }
						selected={ ORDER_UNPAID === status }
					>
						{ translate( 'Awaiting Payment' ) }
					</NavItem>
					<NavItem
						path={ getLink( `/store/orders/${ ORDER_UNFULFILLED }/:site`, site ) }
						selected={ ORDER_UNFULFILLED === status }
					>
						{ translate( 'Awaiting Fulfillment' ) }
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
	state => ( {
		site: getSelectedSiteWithFallback( state ),
		search: getOrdersCurrentSearch( state ),
	} ),
	dispatch => bindActionCreators( { updateCurrentOrdersQuery }, dispatch )
)( localize( OrdersFilterNav ) );
