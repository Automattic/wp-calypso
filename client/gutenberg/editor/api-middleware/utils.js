/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import { isEmpty } from 'lodash';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { debugMiddleware, pathRewriteMiddleware, wpcomProxyMiddleware } from './index';

export class WithAPIMiddleware extends Component {
	state = { hasMiddleware: false };

	componentDidMount() {
		const { siteSlug } = this.props;

		if ( ! isEmpty( siteSlug ) ) {
			this.applyAPIMiddleware( siteSlug );
		}
	}

	componentDidUpdate() {
		const { siteSlug } = this.props;
		const { hasMiddleware } = this.state;

		if ( hasMiddleware || isEmpty( siteSlug ) ) {
			return;
		}

		this.applyAPIMiddleware( siteSlug );
	}

	applyAPIMiddleware = siteSlug => {
		// First middleware in, last out.

		// Relay requests through wpcom API proxy for authentication.
		// This intentionally breaks the middleware chain.
		apiFetch.use( options => wpcomProxyMiddleware( options ) );

		apiFetch.use( ( options, next ) => debugMiddleware( options, next ) );

		// rewrite default API paths to match WP.com equivalents
		// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
		apiFetch.use( ( options, next ) => pathRewriteMiddleware( options, next, siteSlug ) );

		// Point the default root URL
		apiFetch.use( apiFetch.createRootURLMiddleware( 'https://public-api.wordpress.com/' ) );

		this.setState( { hasMiddleware: true } );
	};

	render() {
		return this.state.hasMiddleware ? this.props.children : null;
	}
}
