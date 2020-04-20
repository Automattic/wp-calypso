/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { localizeUrl } from 'lib/i18n-utils';
import InlineSupportLink from 'components/inline-support-link';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/illustration--free-photo-library.svg';

const FreePhotoLibrary = () => {
	const translate = useTranslate();

	return (
		<div className="free-photo-library">
			{ isDesktop() && (
				<img
					className="free-photo-library__demonstration-image"
					src={ freePhotoLibraryVideoPrompt }
					alt={ translate( 'Free Photo Library demonstration' ) }
				/>
			) }
			<CardHeading>{ translate( 'Over 40,000 Free Photos' ) }</CardHeading>
			<p className="free-photo-library__text">
				{ translate(
					'The WordPress.com Free Photo Library integrates ' +
						'your site with beautiful copyright-free photos to ' +
						'create stunning designs.'
				) }
			</p>
			<InlineSupportLink
				supportPostId={ 145498 }
				supportLink={ localizeUrl( 'https://wordpress.com/support/free-photo-library/' ) }
				showIcon={ false }
				text={ translate( 'Learn more' ) }
				tracksEvent={ 'calypso_customer_home_free_photo_library_video_support_page_view' }
				statsGroup="calypso_customer_home"
				statsName="view_free_photo_library_learn_more"
			/>
		</div>
	);
};

export default FreePhotoLibrary;
