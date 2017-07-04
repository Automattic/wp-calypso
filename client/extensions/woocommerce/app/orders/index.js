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
import { getSiteAdminUrl } from 'state/sites/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import OrdersList from './orders-list';

class Orders extends Component {
	render() {
		const { className, createOrderLink, translate } = this.props;
		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Orders' ) }</span> ) }>
					<Button primary href={ createOrderLink }>{ translate( 'Add Order' ) }</Button>
				</ActionHeader>
				<OrdersList />
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const createOrderLink = getSiteAdminUrl( state, site ? site.ID : null, 'post-new.php?post_type=shop_order' );

		return {
			createOrderLink,
			site,
		};
	}
)( localize( Orders ) );
