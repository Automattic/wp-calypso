/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EducationalContent from '../educational-content';
import { EDUCATION_WPCOURSES } from 'calypso/my-sites/customer-home/cards/constants';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'calypso/assets/images/customer-home/illustration--secondary-free-photo-library.svg';

const WpCourses = () => {
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
