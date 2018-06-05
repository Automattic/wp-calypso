/*
 * @format
 */

/**
 * Internal dependencies
 */
import config from 'config';

export function shouldShowRememberPostButton( post ) {
	return config.isEnabled( 'reader/remembered-posts' ) && post.site_ID && ! post.is_external;
}
