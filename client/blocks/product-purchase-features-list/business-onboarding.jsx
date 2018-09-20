/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { translate, link, onClick = noop } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-concierge.svg" /> }
				title={ translate( 'Concierge orientation' ) }
				description={ translate(
					'Schedule a one-on-one orientation session to set up your site ' +
						'and learn more about WordPress.com.'
				) }
				buttonText={ translate( 'Schedule a session' ) }
				href={ link }
				onClick={ onClick }
			/>
		</div>
	);
} );
