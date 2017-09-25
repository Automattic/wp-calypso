/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import OrdersList from './orders-list';
import Button from 'components/button';
import Main from 'components/main';
import config from 'config';
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

function Orders( { className, params, site, translate } ) {
	let addButton = null;

	if ( config.isEnabled( 'woocommerce/extension-orders-create' ) ) {
		addButton = (
			<Button primary href={ getLink( '/store/order/:site/', site ) }>
				{ translate( 'New Order' ) }
			</Button>
		);
	}

	return (
		<Main className={ className }>
			<ActionHeader breadcrumbs={ ( <span>{ translate( 'Orders' ) }</span> ) }>
				{ addButton }
			</ActionHeader>
			<OrdersList currentStatus={ params && params.filter } />
		</Main>
	);
}

export default connect(
	state => ( {
		site: getSelectedSiteWithFallback( state ),
	} )
)( localize( Orders ) );
