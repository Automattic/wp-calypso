/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import paths from 'lib/paths';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="image-multiple"
				title={ translate( 'Video and audio posts' ) }
				description={
					translate(
						'Enrich your posts with video and audio, uploaded directly on your site. ' +
						'No ads or limits. The Premium plan also adds 10GB of file storage.'
					)
				}
				buttonText={ translate( 'Start a new post' ) }
				href={ paths.newPost( selectedSite ) }
			/>
		</div>
	);
} );
