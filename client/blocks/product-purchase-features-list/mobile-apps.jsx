/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import { addQueryArgs } from 'lib/route';

export default localize( ( { translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/apps.svg" /> }
				title={ translate( 'Download our mobile apps' ) }
				description={ translate(
					'Manage all your sites from a single dashboard: publish content, ' +
						'track stats, moderate comments, and more.'
				) }
				buttonText={ translate( 'Get the apps' ) }
				href={ addQueryArgs(
					{
						utm_source: 'calypsomyplan',
						utm_medium: 'cta',
						utm_campaign: 'calypsogetappscard',
					},
					'https://apps.wordpress.com/get?'
				) }
				target="_blank"
			/>
		</div>
	);
} );
