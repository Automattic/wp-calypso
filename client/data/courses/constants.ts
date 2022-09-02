import i18n from 'i18n-calypso';
import type { CourseSlug } from './types';

export const COURSE_SLUGS: { [ key: string ]: CourseSlug } = Object.freeze( {
	BLOGGING_QUICK_START: 'blogging-quick-start',
	PAYMENTS_FEATURES: 'payments-features',
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
	[ COURSE_SLUGS.PAYMENTS_FEATURES ]: {
		headerTitle: i18n.translate( 'Make money from your website.' ),
		headerSubtitle: i18n.translate( 'Watch our tutorial videos to get started.' ),
		headerSummary: [
			i18n.translate( 'Accept one-time or recurring payments' ),
			i18n.translate( 'Accept donations or sell services' ),
			i18n.translate( 'Setup paid, subscriber-only content' ),
			i18n.translate( 'Run a fully featured ecommerce store' ),
		],
	},
};
