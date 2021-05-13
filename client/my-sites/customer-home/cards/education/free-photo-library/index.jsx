/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';
import EducationalContent from '../educational-content';
import { EDUCATION_FREE_PHOTO_LIBRARY } from 'calypso/my-sites/customer-home/cards/constants';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'calypso/assets/images/customer-home/illustration--secondary-free-photo-library.svg';

const FreePhotoLibrary = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'The WordPress.com free photo library' ) }
			description={ translate(
				'Our free photo library integrates your site with over 40,000 beautiful copyright-free photos to create stunning designs.'
			) }
			links={ [
				{
					postId: 145498,
					url: localizeUrl( 'https://wordpress.com/support/free-photo-library/' ),
					text: translate( 'Learn more' ),
					materialIcon: 'play_circle_outline',
				},
			] }
			illustration={ freePhotoLibraryVideoPrompt }
			cardName={ EDUCATION_FREE_PHOTO_LIBRARY }
		/>
	);
};

export default FreePhotoLibrary;
