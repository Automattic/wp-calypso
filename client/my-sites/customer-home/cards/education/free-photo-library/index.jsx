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
import EducationalCard from '../educational-card';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/illustration--free-photo-library.svg';

const FreePhotoLibrary = () => {
	const translate = useTranslate();

	return (
		<EducationalCard
			header={ translate( 'The WordPress.com free photo library' ) }
			text={ translate(
				'Our free photo library integrates your site with over 40,000 beautiful copyright-free photos to create stunning designs.'
			) }
			links={
				<InlineSupportLink
					supportPostId={ 145498 }
					supportLink={ localizeUrl( 'https://wordpress.com/support/free-photo-library/' ) }
					showIcon={ false }
					text={ translate( 'Learn more' ) }
				/>
			}
			illustration={ freePhotoLibraryVideoPrompt }
		/>
	);
};

export default FreePhotoLibrary;
