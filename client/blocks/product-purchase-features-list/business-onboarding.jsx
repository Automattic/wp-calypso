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

export default localize( ( { isWpcomPlan, translate, link, isWhiteGlove, onClick = noop } ) => {
	const title = isWhiteGlove ? 'One-on-one session' : translate( 'Quick Start session' );

	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ conciergeImage } /> }
				title={ title }
				description={
					isWpcomPlan
						? translate(
								'Schedule a one-on-one session with a WordPress.com expert ' +
									'to get your site up and running quickly.'
						  )
						: translate(
								'Schedule a one-on-one orientation session to set up your site ' +
									'and learn more about Jetpack.'
						  )
				}
				buttonText={ translate( 'Schedule a session' ) }
				href={ link }
				onClick={ onClick }
			/>
		</div>
	);
} );
