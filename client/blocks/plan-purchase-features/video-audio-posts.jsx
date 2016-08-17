/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import paths from 'lib/paths';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="plan-purchase-features__item">
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
