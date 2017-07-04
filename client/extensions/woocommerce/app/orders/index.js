/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import OrdersList from './orders-list';

class Orders extends Component {
	render() {
		const { className, site, translate } = this.props;
		const addLink = getLink( '/store/order/:site', site );
		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Orders' ) }</span> ) }>
					<Button primary href={ addLink }>{ translate( 'Add Order' ) }</Button>
				</ActionHeader>
				<OrdersList />
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );

		return {
			site,
		};
	}
)( localize( Orders ) );
