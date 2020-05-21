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

const SimplePayments = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Collect one-time payments' ) }
			description={ translate(
				'Sell physical items, classes, services, and other digital products. You can also accept one-time donations.'
			) }
			links={ [
				{
					postId: 145498,
					url: localizeUrl( 'https://wordpress.com/support/free-photo-library/' ),
					text: translate( 'Collect one-time payments' ),
					icon: 'video',
					tracksEvent: 'calypso_customer_home_free_photo_library_video_support_page_view',
					statsName: 'view_free_photo_library_video',
				},
			] }
			illustration={ freePhotoLibraryVideoPrompt }
		/>
	);
};

export default SimplePayments;
