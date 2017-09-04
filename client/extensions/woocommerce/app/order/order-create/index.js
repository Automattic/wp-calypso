/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import Main from 'components/main';

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
