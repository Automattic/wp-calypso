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
		return (
			<SectionNav>
				<NavTabs label={ translate( 'Status' ) } selectedText={ translate( 'All orders' ) }>
					<NavItem path={ getLink( '/store/orders/:site', site ) } selected={ 'any' === status }>
						{ translate( 'All orders' ) }
					</NavItem>
					<NavItem path={ getLink( '/store/orders/processing/:site', site ) } selected={ 'processing' === status }>
						{ translate( 'Processing' ) }
					</NavItem>
					<NavItem path={ getLink( '/store/orders/completed/:site', site ) } selected={ 'completed' === status }>
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
