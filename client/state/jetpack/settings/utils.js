/**
 * External dependencies
 */
import { get } from 'lodash';

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
 * @param  {Object}   settings   Settings.
 * @return {Object}              Normalized settings.
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

