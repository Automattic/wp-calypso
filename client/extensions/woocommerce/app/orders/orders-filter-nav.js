/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';

class OrdersFilterNav extends Component {
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
			</SectionNav>
		);
	}
}

export default connect(
	state => ( {
		site: getSelectedSiteWithFallback( state ),
	} )
)( localize( OrdersFilterNav ) );
