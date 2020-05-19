/**
 * External dependencies
 */

import { forEach, get, omit } from 'lodash';

/**
 * Normalize settings for use in Redux.
 *
 * @param  {object}   settings   Raw settings.
 * @returns {object}              Normalized settings.
 */
export const normalizeSettings = ( settings ) => {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'carousel_background_color':
				memo[ key ] = settings[ key ] === '' ? 'black' : settings[ key ];
				break;
			case 'custom-content-types':
			case 'jetpack_testimonial':
			case 'jetpack_portfolio':
			case 'jetpack_testimonial_posts_per_page':
			case 'jetpack_portfolio_posts_per_page':
				break;
			case 'jetpack_protect_global_whitelist':
				const whitelist = get( settings[ key ], [ 'local' ], [] );
				memo[ key ] = whitelist.join( '\n' );
				break;
			case 'infinite-scroll':
				break;
			case 'infinite_scroll':
				if ( settings[ 'infinite-scroll' ] !== undefined ) {
					if ( settings[ 'infinite-scroll' ] ) {
						memo[ key ] = settings[ key ] ? 'scroll' : 'button';
					} else {
						memo[ key ] = 'default';
					}
					memo[ 'infinite-scroll' ] = settings[ 'infinite-scroll' ];
				}
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
};

/**
 * Sanitize settings for updating in the Jetpack site.
 *
 * @param  {object}   settings   Settings.
 * @returns {object}              Normalized settings.
 */
export const sanitizeSettings = ( settings ) => {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			// Jetpack's settings endpoint in version 4.9 does not support receiving 'akismet' among the settings
			case 'akismet':
			case 'custom-content-types':
			case 'infinite-scroll':
			case 'jetpack_portfolio':
			case 'jetpack_testimonial':
			case 'jetpack_testimonial_posts_per_page':
			case 'jetpack_portfolio_posts_per_page':
			case 'post_by_email_address':
				if ( settings[ key ] === 'regenerate' ) {
					memo[ key ] = settings[ key ];
				}
				break;
			case 'infinite_scroll':
				if ( settings[ key ] === 'default' ) {
					memo[ 'infinite-scroll' ] = false;
				} else {
					memo[ 'infinite-scroll' ] = true;
					memo[ key ] = settings[ key ] === 'scroll';
				}
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
};

/**
 * Filter out all settings that belong to inactive modules.
 *
 * @param  {object}   settings   Settings.
 * @returns {object}              Normalized settings.
 */
export const filterSettingsByActiveModules = ( settings ) => {
	const moduleSettingsList = {
		minileven: [ 'wp_mobile_excerpt', 'wp_mobile_featured_images', 'wp_mobile_app_promos' ],
		subscriptions: [ 'stb_enabled', 'stc_enabled' ],
		likes: [
			'social_notifications_like',
			'social_notifications_reblog',
			'social_notifications_subscribe',
		],
		markdown: [ 'wpcom_publish_comments_with_markdown' ],
		protect: [ 'jetpack_protect_global_whitelist' ],
		sso: [ 'jetpack_sso_match_by_email', 'jetpack_sso_require_two_step' ],
		comments: [ 'highlander_comment_form_prompt', 'jetpack_comment_form_color_scheme' ],
		carousel: [ 'carousel_background_color', 'carousel_display_exif' ],
		stats: [ 'admin_bar', 'hide_smile', 'count_roles', 'roles' ],
	};
	let filteredSettings = { ...settings };

	forEach( moduleSettingsList, ( moduleSettings, moduleSlug ) => {
		if ( ! settings[ moduleSlug ] ) {
			filteredSettings = omit( filteredSettings, moduleSettings );
		}
		filteredSettings = omit( filteredSettings, moduleSlug );
	} );

	return filteredSettings;
};
