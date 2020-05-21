/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';
import EducationalContent from '../../educational-content';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/illustration--free-photo-library.svg';

const PremiumContent = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Sell access to premium content' ) }
			description={ translate(
				'Sell monthly or yearly subscriptions that offer exclusive access to premium content on your site.'
			) }
			links={ [
				{
					postId: 145498,
					url: localizeUrl( 'https://wordpress.com/support/free-photo-library/' ),
					text: translate( 'Sell Premium Content' ),
					icon: 'video',
					tracksEvent: 'calypso_customer_home_free_photo_library_video_support_page_view',
					statsName: 'view_free_photo_library_video',
				},
			] }
			illustration={ freePhotoLibraryVideoPrompt }
		/>
	);
};

export default PremiumContent;
