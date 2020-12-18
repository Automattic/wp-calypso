/**
 * External dependencies
 */
import React from 'react';
import config from 'calypso/config';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'calypso/components/main';
import OrdersList from './orders-list';
import StoreDeprecatedNotice from '../../components/store-deprecated-notice';

function Orders( { className, params, site, translate } ) {
	let addButton = null;

	if ( config.isEnabled( 'woocommerce/extension-orders-create' ) ) {
		addButton = (
			<Button primary href={ getLink( '/store/order/:site/', site ) }>
				{ translate( 'New order' ) }
			</Button>
		);
	}

	return (
		<Main className={ className } wideLayout>
			<ActionHeader breadcrumbs={ <span>{ translate( 'Orders' ) }</span> }>
				{ addButton }
			</ActionHeader>
			{ config.isEnabled( 'woocommerce/store-deprecated' ) && <StoreDeprecatedNotice /> }
			<OrdersList currentStatus={ params && params.filter } />
		</Main>
	);
}

export default connect( ( state ) => ( {
	site: getSelectedSiteWithFallback( state ),
} ) )( localize( Orders ) );
