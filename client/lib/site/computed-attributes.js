/** @ssr-ready **/

/**
 * External dependencies
 */
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import { isHttps } from 'lib/url';
import config from 'config';

export default function( site ) {
	const attributes = {};

	// If the user has no access to site.options create it as an empty
	// attribute to avoid potential errors when trying to access its sub properties
	attributes.options = site.options || {};

	// Add URL without protocol as a `domain` attribute
	if ( site.URL ) {
		attributes.domain = site.URL.replace( /^https?:\/\//, '' );
		attributes.slug = attributes.domain.replace( /\//g, '::' );
	}
	attributes.title = trim( site.name ) || attributes.domain;

	// If a WordPress.com site has a mapped domain create a `wpcom_url`
	// attribute to allow site selection with either domain.
	if ( attributes.options && attributes.options.is_mapped_domain && ! site.is_jetpack ) {
		attributes.wpcom_url = site.options.unmapped_url.replace( /^https?:\/\//, '' );
	}

	// If a site has an `is_redirect` property use the `unmapped_url`
	// for the slug and domain to match the wordpress.com original site.
	if ( ( attributes.options && attributes.options.is_redirect ) || site.hasConflict ) {
		attributes.slug = attributes.options.unmapped_url.replace( /^https?:\/\//, '' );
		attributes.domain = attributes.slug;
	}

	// The 'standard' post format is saved as an option of '0'
	if ( ! attributes.options.default_post_format || attributes.options.default_post_format === '0' ) {
		attributes.options.default_post_format = 'standard';
	}

	//TODO:(ehg) Pull out into selector when my-sites/sidebar is connected
	attributes.is_previewable = !! (
		config.isEnabled( 'preview-layout' ) &&
		attributes.options.unmapped_url &&
		! site.is_vip &&
		isHttps( attributes.options.unmapped_url )
	);

	//TODO:(ehg) Replace instances with canCurrentUser selector when my-sites/sidebar is connected
	attributes.is_customizable = !! (
		site.capabilities &&
		site.capabilities.edit_theme_options
	);

	return attributes;
}
