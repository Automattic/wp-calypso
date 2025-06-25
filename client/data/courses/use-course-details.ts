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
			headerTitle: translate( 'Start your blog.' ),
			headerSubtitle: translate( 'Share your voice.' ),
			headerSummary: [
				translate( 'Find the perfect look for your blog' ),
				translate( 'Craft posts that express your ideas' ),
				translate( 'Keep your content clear and organized' ),
				translate( 'Grow your audience and engage readers' ),
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
			headerTitle: translate( 'Build your website.' ),
			headerSubtitle: translate( 'Launch your dream.' ),
			headerSummary: [
				translate( 'Choose a theme to suit your vision' ),
				translate( 'Set up your site’s essential pages' ),
				translate( 'Customize the design to suit your needs' ),
				translate( 'Share your website with the world' ),
			],
		};
	}
};

export default useCourseDetails;
