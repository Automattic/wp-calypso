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
import { updateCurrentOrdersQuery } from 'woocommerce/state/ui/orders/actions';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';

class OrdersFilterNav extends Component {
	doSearch = ( search ) => {
		this.props.updateCurrentOrdersQuery( this.props.site.ID, { search } );
	}

	clearSearch = () => {
		this.doSearch( '' );
	}

	render() {
		const { translate, site, status } = this.props;
		let currentSelection = translate( 'All orders' );
		if ( 'pay' === status ) {
			currentSelection = translate( 'Awaiting Payment' );
		} else if ( 'fulfill' === status ) {
			currentSelection = translate( 'Awaiting Fulfillment' );
		} else if ( 'finished' === status ) {
			currentSelection = translate( 'Completed' );
		}

		return (
			<SectionNav selectedText={ currentSelection }>
				<NavTabs label={ translate( 'Status' ) } selectedText={ currentSelection }>
					<NavItem path={ getLink( '/store/orders/:site', site ) } selected={ 'any' === status }>
						{ translate( 'All orders' ) }
					</NavItem>
					<NavItem path={ getLink( '/store/orders/pay/:site', site ) } selected={ 'pay' === status }>
						{ translate( 'Awaiting Payment' ) }
					</NavItem>
					<NavItem path={ getLink( '/store/orders/fulfill/:site', site ) } selected={ 'fulfill' === status }>
						{ translate( 'Awaiting Fulfillment' ) }
					</NavItem>
					<NavItem path={ getLink( '/store/orders/finished/:site', site ) } selected={ 'finished' === status }>
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
