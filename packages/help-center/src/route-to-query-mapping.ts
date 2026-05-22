import { __ } from '@wordpress/i18n';

export const useQueryForRoute = ( currentRoute: string ) => {
	const urlMapping = {
		'/advertising/': __( 'advertising' ),
		'/comments/': __( 'comments' ),
		'/discover': __( 'discover blogs' ),
		'/export': __( 'export your content' ),
		'/hosting-config/': __( 'hosting configuration' ),
		'/import': __( 'import site content' ),
		'/marketing/sharing-buttons/': __( 'social share' ),
		'/marketing': __( 'marketing tools' ),
		'/me/get-apps': __( 'wordpress apps' ),
		'/me/mcp': __( 'mcp' ),
		'/me/notifications': __( 'notification settings' ),
		'/me/privacy': __( 'privacy' ),
		'/me/site-blocks': __( 'blocked sites' ),
		'/plugins/manage': __( 'manage plugins' ),
		'/reader': __( 'reader' ),
		'/reader/conversations': __( 'conversations' ),
		'/reader/list': __( 'reader list' ),
		'/reader/notifications': __( 'notifications' ),
		'/reader/search': __( 'search' ),
		'/reader/subscriptions': __( 'manage subscriptions' ),
		'/settings/performance/': __( 'performance settings' ),
		'/settings/podcasting/': __( 'podcasting' ),
		'/settings/reading/': __( 'reading settings' ),
		'/settings/taxonomies/category/': __( 'site categories' ),
		'/settings/taxonomies/post_tag/': __( 'post tag' ),
		'/settings/writing/': __( 'writing settings' ),
		'/stats': __( 'stats' ),
		'/tags': __( 'tags' ),
		'/woocommerce': __( 'woocommerce' ),
		'/wp-admin/admin.php?page=akismet-key-config': __( 'site spam' ),
		'/wp-admin/admin.php?page=jetpack-search': __( 'jetpack search' ),
		'/wp-admin/admin.php?page=stats': __( 'stats' ),
		'/wp-admin/admin.php?page=wc': __( 'woocommerce' ),
		'/wp-admin/admin.php?page=jetpack-forms-admin': __( 'forms' ),
		// Jetpack → Settings tabs (Atomic). Hash routes under the Jetpack admin
		// page; each tab maps to a contextual support query. See DOTSUP-460.
		'/wp-admin/admin.php?page=jetpack#/security': __( 'security settings' ),
		'/wp-admin/admin.php?page=jetpack#/performance': __( 'performance and speed' ),
		'/wp-admin/admin.php?page=jetpack#/writing': __( 'writing settings' ),
		'/wp-admin/admin.php?page=jetpack#/sharing': __( 'social sharing' ),
		'/wp-admin/admin.php?page=jetpack#/discussion': __( 'comment settings' ),
		'/wp-admin/admin.php?page=jetpack#/traffic': __( 'traffic seo' ),
		'/wp-admin/admin.php?page=jetpack#/earn': __( 'earn money from your site' ),
		'/wp-admin/edit.php?post_type=jetpack-portfolio': __( 'portfolios' ),
		'/wp-admin/edit.php?post_type=jetpack-testimonial': __( 'testimonials' ),
		'/wp-admin/index.php?page=my-blogs': __( 'my sites' ),
		'/wp-admin/options-general.php?page=debug-bar-extender': __( 'debug bar extender' ),
		'/wp-admin/options-media.php': __( 'media settings' ),
		'/wp-admin/options-permalink.php': __( 'permalinks' ),
		'/wp-admin/post-new.php?post_type=jetpack-testimonial': __( 'new testimonial' ),
	};

	// Find exact URL matches
	const exactMatch = urlMapping[ currentRoute as keyof typeof urlMapping ];
	if ( exactMatch ) {
		return exactMatch;
	}

	// Fuzzier matches
	const urlMatchKey = Object.keys( urlMapping ).find( ( key ) => currentRoute?.startsWith( key ) );
	return urlMatchKey ? urlMapping[ urlMatchKey as keyof typeof urlMapping ] : '';
};
