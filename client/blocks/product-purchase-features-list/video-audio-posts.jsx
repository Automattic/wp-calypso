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
import { isWpComBusinessPlan, isWpComEcommercePlan, isWpComPremiumPlan } from 'lib/plans';

/**
 * Image dependencies
 */
import videoImage from 'assets/images/illustrations/video-hosting.svg';

function getDescription( plan, translate ) {
	if ( isWpComBusinessPlan( plan ) ) {
		return translate(
			'Enrich your site and boost engagement with video and audio. Your Business Plan includes 200 GB ' +
				'of storage, giving you plenty of room for all types of media.'
		);
	}
	if ( isWpComEcommercePlan( plan ) ) {
		return translate(
			'Enrich your posts and pages with video or audio. Upload as much media as you want, ' +
				'directly to your site — the Ecommerce Plan has unlimited storage.'
		);
	}

	if ( isWpComPremiumPlan( plan ) ) {
		return translate(
			'Enrich your posts and pages with video or audio. Upload up to 13 GB of media directly to your site.'
		);
	}

	return '';
}

export const VideoAudioPosts = ( { selectedSite, plan, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ videoImage } /> }
				title={ translate( 'Video and audio posts' ) }
				description={ getDescription( plan, translate ) }
				buttonText={ translate( 'Start a new post' ) }
				href={ newPost( selectedSite ) }
			/>
		</div>
	);
};

export default localize( VideoAudioPosts );
