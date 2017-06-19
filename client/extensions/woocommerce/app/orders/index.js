/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import OrderHeader from './order-header';
import OrdersList from './orders-list';
import SectionNav from 'components/section-nav';

class Orders extends Component {
	render() {
		const { className, site, translate } = this.props;
		return (
			<Main className={ className }>
				<OrderHeader siteSlug={ site.slug } />

				<div className="orders__list">
					<SectionNav>
						<NavTabs label={ translate( 'Status' ) } selectedText={ translate( 'All orders' ) }>
							<NavItem path="/orders" selected={ true }>{ translate( 'All orders' ) }</NavItem>
							<NavItem path="/orders/new" selected={ false }>{ translate( 'New' ) }</NavItem>
							<NavItem path="/orders/pending" selected={ false }>{ translate( 'Pending' ) }</NavItem>
							<NavItem path="/orders/processing" selected={ false }>{ translate( 'Processing' ) }</NavItem>
							<NavItem path="/orders/failed" selected={ false }>{ translate( 'Failed' ) }</NavItem>
						</NavTabs>
					</SectionNav>

					<OrdersList />
				</div>
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );

		return {
			site,
		};
	}
)( localize( Orders ) );
