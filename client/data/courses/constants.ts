import i18n from 'i18n-calypso';
import type { CourseSlug } from './types';

export const COURSE_SLUGS: { [ key: string ]: CourseSlug } = Object.freeze( {
	BLOGGING_QUICK_START: 'blogging-quick-start',
} );

export const COURSE_DETAILS = {
	[ COURSE_SLUGS.BLOGGING_QUICK_START ]: {
		headerTitle: i18n.translate( 'Watch five videos.' ),
		headerSubtitle: i18n.translate( 'Save yourself hours.' ),
		headerSummary: [
			i18n.translate( 'Learn the basics of blogging' ),
			i18n.translate( 'Familiarize yourself with WordPress' ),
			i18n.translate( 'Upskill and save hours' ),
			i18n.translate( 'Set yourself up for blogging success' ),
		],
	},
};
