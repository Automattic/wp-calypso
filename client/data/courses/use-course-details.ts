/**
 * External Dependencies
 */
import { useTranslate } from 'i18n-calypso';
/**
 * Internal Dependencies
 */
import { COURSE_SLUGS } from './constants';
import type { CourseSlug } from './types';

interface CourseDetails {
	headerTitle: string;
	headerSubtitle: string;
	headerSummary: string[];
}

const useCourseDetails = ( courseSlug: CourseSlug ): CourseDetails | undefined => {
	const translate = useTranslate();

	if ( courseSlug === COURSE_SLUGS.BLOGGING_QUICK_START ) {
		return {
			headerTitle: translate( 'Watch five videos.' ),
			headerSubtitle: translate( 'Save yourself hours.' ),
			headerSummary: [
				translate( 'Learn the basics of blogging' ),
				translate( 'Familiarize yourself with WordPress' ),
				translate( 'Upskill and save hours' ),
				translate( 'Set yourself up for blogging success' ),
			],
		};
	} else if ( courseSlug === COURSE_SLUGS.PAYMENTS_FEATURES ) {
		return {
			headerTitle: translate( 'Make money from your website.' ),
			headerSubtitle: translate( 'Watch our tutorial videos to get started.' ),
			headerSummary: [
				translate( 'Accept one-time or recurring payments' ),
				translate( 'Accept donations or sell services' ),
				translate( 'Setup paid, subscriber-only content' ),
				translate( 'Run a fully featured ecommerce store' ),
			],
		};
	} else if ( courseSlug === COURSE_SLUGS.SITE_EDITOR_QUICK_START ) {
		return {
			headerTitle: translate( 'Watch four videos.' ),
			headerSubtitle: translate( 'Save yourself hours.' ),
			headerSummary: [
				translate( 'Learn the building blocks of site building' ),
				translate( 'Understand how to add your style to your site' ),
				translate( 'Upskill now to save hours later' ),
				translate( 'Set yourself up for creative success' ),
			],
		};
	}
};

export default useCourseDetails;
