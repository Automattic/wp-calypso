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
import { newPost } from 'lib/paths';
import { PLAN_BUSINESS, PLAN_PREMIUM } from 'lib/plans/constants';

export default localize( ( { selectedSite, plan, translate } ) => {
	let featureDescription;

	switch ( plan ) {
		case PLAN_BUSINESS:
			featureDescription = translate(
				'Enrich your posts and pages with video or audio. Upload as much media as you want, ' +
					'directly to your site — the Business Plan has unlimited storage.'
			);
			break;
		case PLAN_PREMIUM:
			featureDescription = translate(
				'Enrich your posts and pages with video or audio. Upload up to 10GB of media directly to your site.'
			);
			break;
		default:
			featureDescription = '';
			break;
	}

	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/upgrades/media-post.svg" /> }
				title={ translate( 'Video and audio posts' ) }
				description={ featureDescription }
				buttonText={ translate( 'Start a new post' ) }
				href={ newPost( selectedSite ) }
			/>
		</div>
	);
} );
