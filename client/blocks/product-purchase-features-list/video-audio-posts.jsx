import {
	getPlan,
	isProPlan,
	isWooExpressMediumPlan,
	isWooExpressPlan,
	isWooExpressSmallPlan,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPremiumPlan,
	isWpComProPlan,
} from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import videoImage from 'calypso/assets/images/illustrations/video-hosting.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { newPost } from 'calypso/lib/paths';

function getDescription( plan, translate ) {
	if ( isWpComProPlan( plan ) ) {
		return translate(
			'Enrich your posts and pages with video or audio. Upload plenty of media, ' +
				'directly to your site — the Pro Plan has 50 GB storage.'
		);
	}

	if ( isWpComBusinessPlan( plan ) ) {
		return translate(
			'Enrich your posts and pages with video or audio. Upload plenty of media, ' +
				'directly to your site — the Business Plan has 200 GB storage.'
		);
	}
	if ( isProPlan( plan ) ) {
		return translate(
			'Enrich your posts and pages with video or audio. Upload plenty of media, ' +
				'directly to your site — the Pro Plan has 50 GB storage.'
		);
	}
	if ( isWooExpressPlan( plan ) ) {
		const wooExpressPlan = getPlan( plan );
		let wooExpressStorageLimit = 3;
		if ( isWooExpressMediumPlan( plan ) ) {
			wooExpressStorageLimit = 200;
		} else if ( isWooExpressSmallPlan( plan ) ) {
			wooExpressStorageLimit = 50;
		}
		// Translators: %(planName)s is the name of the plan, %(storageLimit)d is the storage limit in GB.
		return translate(
			'Enrich your posts and pages with video or audio. Upload plenty of media, ' +
				'directly to your site — the Woo Express: %(planName)s plan has %(storageLimit)d GB storage.',
			{
				args: {
					planName: wooExpressPlan.getTitle(),
					storageLimit: wooExpressStorageLimit,
				},
			}
		);
	}
	if ( isWpComEcommercePlan( plan ) ) {
		return translate(
			'Enrich your posts and pages with video or audio. Upload plenty of media, ' +
				'directly to your site — the Ecommerce Plan has 200 GB storage.'
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
