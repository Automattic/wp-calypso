import { localizeUrl } from '@automattic/i18n-utils';
import { dispatch } from '@wordpress/data';
import type { HelpCenterDispatch } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';

const WEBSITE_COURSE = 'create-your-website';
const BLOG_COURSE = 'create-your-blog';
const AUDIENCE_COURSE = 'grow-your-audience';
const MONETIZE_COURSE = 'monetize-your-website';
const STORE_COURSE = 'build-your-store-with-woocommerce';

/**
 * Task ids mapped to the course video lesson that walks through that task.
 * Lessons live on the support site under /support/courses/<course>/<lesson>/,
 * which the Help Center renders with lesson navigation and an embedded video.
 */
const COURSE_LESSONS_BY_TASK: Record< string, string > = {
	design_selected: `${ WEBSITE_COURSE }/choose-a-theme/`,
	design_completed: `${ WEBSITE_COURSE }/choose-a-theme/`,
	design_edited: `${ WEBSITE_COURSE }/choose-a-theme/`,
	site_theme_selected: `${ WEBSITE_COURSE }/choose-a-theme/`,
	front_page_updated: `${ WEBSITE_COURSE }/edit-your-homepage/`,
	add_new_page: `${ WEBSITE_COURSE }/add-new-pages/`,
	edit_page: `${ WEBSITE_COURSE }/add-new-pages/`,
	update_about_page: `${ WEBSITE_COURSE }/add-new-pages/`,
	add_about_page: `${ WEBSITE_COURSE }/add-new-pages/`,
	setup_free: `${ WEBSITE_COURSE }/fonts-and-colors/`,
	site_launched: `${ WEBSITE_COURSE }/launch-your-site/`,
	link_in_bio_launched: `${ WEBSITE_COURSE }/launch-your-site/`,
	videopress_launched: `${ WEBSITE_COURSE }/launch-your-site/`,
	blog_launched: `${ BLOG_COURSE }/launch-and-grow-your-blog/`,
	first_post_published: `${ BLOG_COURSE }/create-blog-posts/`,
	first_post_published_newsletter: `${ BLOG_COURSE }/create-blog-posts/`,
	write_3_posts: `${ BLOG_COURSE }/create-blog-posts/`,
	post_sharing_enabled: `${ BLOG_COURSE }/comments-and-social-sharing/`,
	subscribers_added: `${ BLOG_COURSE }/grow-your-subscribers/`,
	import_subscribers: `${ BLOG_COURSE }/grow-your-subscribers/`,
	manage_subscribers: `${ BLOG_COURSE }/grow-your-subscribers/`,
	add_10_email_subscribers: `${ BLOG_COURSE }/grow-your-subscribers/`,
	add_first_subscribers: `${ BLOG_COURSE }/grow-your-subscribers/`,
	start_building_your_audience: `${ BLOG_COURSE }/grow-your-subscribers/`,
	add_subscribe_block: `${ AUDIENCE_COURSE }/convert-visitors-into-email-subscribers/`,
	drive_traffic: `${ AUDIENCE_COURSE }/leverage-social-media-for-growth/`,
	connect_social_media: `${ AUDIENCE_COURSE }/leverage-social-media-for-growth/`,
	set_up_payments: `${ MONETIZE_COURSE }/how-to-accept-payments/`,
	stripe_connected: `${ MONETIZE_COURSE }/how-to-accept-payments/`,
	newsletter_plan_created: `${ MONETIZE_COURSE }/turn-your-newsletter-into-a-paid-subscription/`,
	manage_paid_newsletter_plan: `${ MONETIZE_COURSE }/turn-your-newsletter-into-a-paid-subscription/`,
	earn_money: `${ MONETIZE_COURSE }/turn-your-newsletter-into-a-paid-subscription/`,
	paid_offer_created: `${ MONETIZE_COURSE }/create-paid-content/`,
	woocommerce_setup: `${ STORE_COURSE }/get-started-with-woo/`,
	woo_products: `${ STORE_COURSE }/add-products/`,
	woo_woocommerce_payments: `${ STORE_COURSE }/set-up-payments/`,
	woo_tax: `${ STORE_COURSE }/collect-sales-tax/`,
	woo_customize_store: `${ STORE_COURSE }/set-up-store-pages/`,
	woo_launch_site: `${ STORE_COURSE }/launch-extend/`,
};

/**
 * Checklists shown to blog-intent users, where theme/homepage/launch tasks
 * should point at the "Create your blog" course instead of the website one.
 */
const BLOG_CHECKLIST_SLUGS = [
	'write',
	'intent-write',
	'design-first',
	'start-writing',
	'newsletter',
	'intent-newsletter-goal',
	'intent-free-newsletter',
	'intent-paid-newsletter',
];

const BLOG_COURSE_LESSON_OVERRIDES: Record< string, string > = {
	design_selected: `${ BLOG_COURSE }/blog-theme/`,
	design_completed: `${ BLOG_COURSE }/blog-theme/`,
	design_edited: `${ BLOG_COURSE }/blog-theme/`,
	site_theme_selected: `${ BLOG_COURSE }/blog-theme/`,
	front_page_updated: `${ BLOG_COURSE }/blog-homepage/`,
	site_launched: `${ BLOG_COURSE }/launch-and-grow-your-blog/`,
};

export const getCourseLessonUrl = (
	taskId: string,
	checklistSlug?: string | null
): string | null => {
	const lessonPath =
		( checklistSlug &&
			BLOG_CHECKLIST_SLUGS.includes( checklistSlug ) &&
			BLOG_COURSE_LESSON_OVERRIDES[ taskId ] ) ||
		COURSE_LESSONS_BY_TASK[ taskId ];

	return lessonPath ? localizeUrl( `https://wordpress.com/support/courses/${ lessonPath }` ) : null;
};

type WpWithData = {
	data?: {
		dispatch?: ( store: string ) => unknown;
	};
};

const loadHelpCenterDispatch = async () => {
	// In wp-admin the Help Center registers its store on the global `wp.data`
	// registry, which is separate from this bundle's `@wordpress/data` registry.
	const wp = typeof window !== 'undefined' ? ( window.wp as WpWithData | undefined ) : undefined;
	if ( wp?.data?.dispatch?.( HELP_CENTER_STORE ) ) {
		return wp.data.dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ];
	}

	if ( ! dispatch( HELP_CENTER_STORE ) ) {
		const { HelpCenter: HelpCenterStore } = await import(
			/* webpackChunkName: "async-load-automattic-data-stores" */ '@automattic/data-stores'
		);
		HelpCenterStore.register();
	}

	return dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ];
};

/**
 * Opens a course video lesson in the Help Center, falling back to a new tab
 * when the Help Center is not available.
 */
export const openCourseLesson = async ( lessonUrl: string ) => {
	try {
		const helpCenterDispatch = await loadHelpCenterDispatch();
		if ( helpCenterDispatch?.setShowSupportDoc ) {
			helpCenterDispatch.setShowSupportDoc( lessonUrl );
			return;
		}
	} catch {
		// Fall through to opening in a new tab.
	}

	window.open( lessonUrl, '_blank', 'noopener,noreferrer' );
};
