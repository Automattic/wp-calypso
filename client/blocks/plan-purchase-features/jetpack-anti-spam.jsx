/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { translate } ) => {
	return (
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="comment"
				title={ translate( 'Anti-Spam' ) }
				description={ translate(
					'Akismet filters out comment and other forms of spam, so you can focus on more important things.'
				) }
			/>
		</div>
	);
} );
