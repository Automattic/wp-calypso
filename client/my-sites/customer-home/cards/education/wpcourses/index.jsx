import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import React from 'react';
import freePhotoLibraryVideoPrompt from 'calypso/assets/images/customer-home/illustration--secondary-wp-courses.svg';
import { EDUCATION_WPCOURSES } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const WpCourses = () => {
	const isEnglish = config( 'english_locales' ).includes( getLocaleSlug() );

	if ( ! isEnglish ) {
		return null;
	}

	return (
		<EducationalContent
			title="The official WordPress.com blogging guide"
			description="Learn everything you need to know to build a popular blog in this course taught by world-class WordPress experts."
			links={ [
				{
					externalLink: true,
					url: 'https://wpcourses.com/course/blogging-beginners-course/',
					text: 'Learn more',
				},
			] }
			illustration={ freePhotoLibraryVideoPrompt }
			cardName={ EDUCATION_WPCOURSES }
		/>
	);
};

export default WpCourses;
