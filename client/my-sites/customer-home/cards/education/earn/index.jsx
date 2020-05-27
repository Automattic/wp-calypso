/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import EducationalContent from '../educational-content';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/illustration--free-photo-library.svg';

const EducationEarn = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Make money from your website' ) }
			description={ translate(
				'Accept credit and debit card payments on your website for just about anything.'
			) }
			links={ [
				{
					buttonLink: true,
					url:  `/earn/${ siteSlug }`,
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

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps ) ( EducationEarn );
