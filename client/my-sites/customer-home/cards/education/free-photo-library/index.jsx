/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';
import InlineSupportLink from 'components/inline-support-link';
import EducationalContent from '../educational-content';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/illustration--free-photo-library.svg';

const FreePhotoLibrary = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'The WordPress.com free photo library' ) }
			description={ translate(
				'Our free photo library integrates your site with over 40,000 beautiful copyright-free photos to create stunning designs.'
			) }
			links={
				<InlineSupportLink
					supportPostId={ 145498 }
					supportLink={ localizeUrl( 'https://wordpress.com/support/free-photo-library/' ) }
					showIcon={ false }
					text={ translate( 'Learn more' ) }
					tracksEvent="calypso_customer_home_free_photo_library_video_support_page_view"
					statsGroup="calypso_customer_home"
					statsName="view_free_photo_library_video"
				/>
			}
			illustration={ freePhotoLibraryVideoPrompt }
		/>
	);
};

export default FreePhotoLibrary;
