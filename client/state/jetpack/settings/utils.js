/**
 * External dependencies
 */
import { forEach, get, omit } from 'lodash';

/**
 * Normalize settings for use in Redux.
 *
 * @param  {Object}   settings   Raw settings.
 * @return {Object}              Normalized settings.
 */
export const normalizeSettings = ( settings ) => {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'carousel_background_color':
				memo[ key ] = settings [ key ] === '' ? 'black' : settings[ key ];
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
 * @param  {Object}   settings   Settings.
 * @return {Object}              Normalized settings.
 */
export const sanitizeSettings = ( settings ) => {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'post_by_email_address':
				break;
			case 'infinite-scroll':
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
 * @param  {Object}   settings   Settings.
 * @return {Object}              Normalized settings.
 */
export const filterSettingsByActiveModules = ( settings ) => {
	const moduleSettingsList = {
		minileven: [
			'wp_mobile_excerpt',
			'wp_mobile_featured_images',
			'wp_mobile_app_promos',
		],
		subscriptions: [
			'stb_enabled',
			'stc_enabled',
		],
		likes: [
			'social_notifications_like',
			'social_notifications_reblog',
			'social_notifications_subscribe',
		],
		markdown: [
			'wpcom_publish_comments_with_markdown',
		],
		protect: [
			'jetpack_protect_global_whitelist',
		],
		sso: [
			'jetpack_sso_match_by_email',
			'jetpack_sso_require_two_step',
		],
		'after-the-deadline': [
			'onpublish',
			'onupdate',
			'guess_lang',
			'Bias Language',
			'Cliches',
			'Complex Expression',
			'Diacritical Marks',
			'Double Negative',
			'Hidden Verbs',
			'Jargon Language',
			'Passive voice',
			'Phrases to Avoid',
			'Redundant Expression',
			'ignored_phrases',
		],
		'custom-content-types': [
			'jetpack_testimonial',
			'jetpack_portfolio',
		],
		comments: [
			'highlander_comment_form_prompt',
			'jetpack_comment_form_color_scheme'
		],
		carousel: [
			'carousel_background_color',
			'carousel_display_exif'
		],
		stats: [
			'admin_bar',
			'hide_smile',
			'count_roles',
			'roles',
		]
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
