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
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import OrdersList from './orders-list';

class Orders extends Component {
	render() {
		const { className, translate } = this.props;
		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Orders' ) }</span> ) } />
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
