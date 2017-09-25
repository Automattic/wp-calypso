/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Main from 'components/main';
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class OrderCreate extends Component {

	render() {
		const { className, site, translate } = this.props;
		const breadcrumbs = [
			( <a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a> ),
			( <span>{ translate( 'New Order' ) }</span> ),
		];
		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button primary>{ translate( 'Save Order' ) }</Button>
				</ActionHeader>

				<div className="order-create__container"></div>
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;

		return {
			site,
			siteId,
		};
	}
)( localize( OrderCreate ) );
