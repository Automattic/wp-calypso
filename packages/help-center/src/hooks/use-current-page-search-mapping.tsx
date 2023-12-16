// const currentPageSearchMapping: { [ key: string ]: string } = {
// 	'/home/': 'home',
// 	'/stats/': 'statistics',
// 	'/add-ons/': 'add-ons',
// 	'/mailboxes': 'mail',
// 	'/pages/': 'pages',
// 	'/comments/': 'comments',
// 	'/backup/': 'backup',
// 	'/themes/': 'themes',
// 	'/plugins/': 'plugins',
// 	'/plans/': 'upgrade plan',
// 	'/email/': 'manage emails',
// 	'/purchases/subscriptions/': 'subscription purchases',
// 	'/purchases/payment-methods/': 'payment methods',
// 	'/purchases/billing-history/': 'billing history',
// 	'/people/new': 'invite user',
// 	'/me/security': 'security',
// 	'/me/purchases': 'purchases',
// 	'/me/privacy': 'privacy',
// 	'/me/notifications': 'notification settings',
// 	'/me/account': 'account settings',
// 	'/me/site-blocks': 'blocked sites',
// 	'/me/get-apps': 'wordpress apps',
// 	'/me': 'my profile',
// 	'/settings/general/': 'general settings',
// 	'/settings/writing/': 'writing settings',
// 	'/settings/reading/': 'reading settings',
// 	'/settings/newsletter/': 'newsletter settings',
// 	'/settings/performance/': 'performance settings',
// 	'/settings/taxonomies/category/': 'site categories',
// 	'/settings/taxonomies/post_tag/': 'post tag',
// 	'/wp-admin/edit.php?post_type=jetpack-testimonial': 'testimonials',
// 	'/wp-admin/edit.php?post_type=page': 'pages',
// 	'/wp-admin/edit.php': 'posts',
// 	'/wp-admin/edit.php?post_type=feedback': 'feedback form',
// 	'/wp-admin/post-new.php?post_type=jetpack-testimonial': 'new testimonial',
// 	'/wp-admin/post-new.php?post_type=page': 'new page',
// 	'/wp-admin/post-new.php': 'new post',
// 	'/wp-admin/admin.php?page=akismet-key-config': 'site spam',
// 	'/wp-admin/admin.php?page=jetpack-search': 'jetpack search',
// 	'/wp-admin/admin.php?page=polls': 'crowdsignal',
// 	'/wp-admin/admin.php?page=ratings': 'ratings',
// 	'/wp-admin/options-general.php?page=debug-bar-extender': 'debug bar extender',
// 	'/wp-admin/index.php?page=my-blogs': 'my sites',
// 	'/read/conversations': 'conversations',
// 	'/read/notifications': 'notifications',
// 	'/read/subscriptions': 'manage subscriptions',
// 	'/read/list': 'reader list',
// 	'/read/search': 'search',
// 	'/read': 'reader',
// 	'/discover': 'discover blogs',
// 	'/tags': 'tags',
// 	'/sites': 'manage sites',
// };

const trimWhiteSpace = ( str: string ) => str.replace( /^\s+|\s+$/g, '' );

export function useCurrentPageSearchMapping() {
	// Commenting logic until I figure out how to get latest pathname and search
	// window.location is sometimes returning stale value (previous location)

	// const currentPathname = window?.location?.pathname;
	// const currentSearch = window?.location?.search;

	// const currentPage = currentPathname + currentSearch;

	// Check if current page pathname starts with any of the keys in currentPageSearchMapping
	// If it does, then return the value of that key as the search query
	// Otherwise, check if there's an h1, h2, or h3 element on the page and use that as the search query

	let searchQuery = '';
	// for ( const key of Object.keys( currentPageSearchMapping ) ) {
	// 	if ( currentPage.startsWith( key ) ) {
	// 		searchQuery = currentPageSearchMapping[ key ];
	// 		break;
	// 	}
	// }

	if ( ! searchQuery ) {
		const h1 = document.querySelector( 'h1' );
		const h2 = document.querySelector( 'h2' );
		const h3 = document.querySelector( 'h3' );

		if ( h1 && h1.textContent ) {
			searchQuery = trimWhiteSpace( h1.textContent );
		} else if ( h2 && h2.textContent ) {
			searchQuery = trimWhiteSpace( h2.textContent );
		} else if ( h3 && h3.textContent ) {
			searchQuery = trimWhiteSpace( h3.textContent );
		}
	}

	return searchQuery;
}
