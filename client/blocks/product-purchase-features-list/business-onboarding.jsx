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

/**
 * Image dependencies
 */
import conciergeImage from 'assets/images/illustrations/jetpack-concierge.svg';

export default localize( ( { isWpcomPlan, translate, link, onClick = noop } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ conciergeImage } /> }
				title={ translate( 'Quick Start session' ) }
				description={ translate(
					'Schedule a one-on-one orientation session to set up your site ' +
						'and learn more about %(serviceName)s.',
					{
						args: {
							serviceName: isWpcomPlan ? 'WordPress.com' : 'Jetpack',
						},
					}
				) }
				buttonText={ translate( 'Schedule a session' ) }
				href={ link }
				onClick={ onClick }
			/>
		</div>
	);
} );
