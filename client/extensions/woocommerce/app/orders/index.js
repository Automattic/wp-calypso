/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Main from 'components/main';
import OrdersList from './orders-list';

function Orders( { className, params, translate } ) {
	return (
		<Main className={ className }>
			<ActionHeader breadcrumbs={ ( <span>{ translate( 'Orders' ) }</span> ) } />
			<OrdersList currentStatus={ params && params.filter } />
		</Main>
	);
}

export default localize( Orders );
