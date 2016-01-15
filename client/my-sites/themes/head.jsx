/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from 'layout/head';

const ThemesHead = ( { tier, children } ) => (
	<Head
		title={ get( 'title', tier ) }
		description={ get( 'description', tier ) }
		canonicalUrl={ get( 'canonicalUrl', tier ) } >
		{ children }
	</Head>
)

ThemesHead.propTypes = {
	tier: React.PropTypes.string.isRequired
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
}

function get( key, tier ) {
	return tier in themesMeta && key in themesMeta[ tier ]
	? themesMeta[ tier ][ key ]
	: '';
}

export default ThemesHead;
