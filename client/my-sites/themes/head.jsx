/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from 'layout/head';

const ThemesHead = ( { title, description, canonicalUrl, type, image, tier, children } ) => (
	<Head
		title={ title ? title : get( 'title', tier ) }
		description={ description ? description : get( 'description', tier ) }
		canonicalUrl={ canonicalUrl ? canonicalUrl : get( 'canonicalUrl', tier ) }
		type={ type ? type : 'website' }
		site_name={ 'WordPress.com' }
		image={ image ? image : {} } >
		{ children }
	</Head>
);

ThemesHead.propTypes = {
	title: React.PropTypes.string,
	tier: React.PropTypes.string
};

const themesMeta = {
	all: {
		title: 'WordPress Themes — WordPress.com',
		description: 'Beautiful, responsive, free and premium WordPress themes for your photography site, portfolio, magazine, business website, or blog.',
		canonicalUrl: 'https://wordpress.com/design',
	},
	free: {
		title: 'Free WordPress Themes — WordPress.com',
		description: 'Discover Free WordPress Themes on the WordPress.com Theme Showcase.',
		canonicalUrl: 'https://wordpress.com/design/type/free',
	},
	premium: {
		title: 'Premium WordPress Themes — WordPress.com',
		description: 'Discover Premium WordPress Themes on the WordPress.com Theme Showcase.',
		canonicalUrl: 'https://wordpress.com/design/type/premium',
	}
};

function get( key, tier ) {
	return tier in themesMeta && key in themesMeta[ tier ]
	? themesMeta[ tier ][ key ]
	: '';
}

export default ThemesHead;
