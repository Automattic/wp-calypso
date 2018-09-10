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
import {
	debugMiddleware,
	pathRewriteMiddleware,
	urlRewriteMiddleware,
	wpcomProxyMiddleware,
} from './index';

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

		// This call intentionally breaks the middleware chain.
		apiFetch.use( options => wpcomProxyMiddleware( options ) );

		apiFetch.use( ( options, next ) => debugMiddleware( options, next ) );

		apiFetch.use( ( options, next ) => urlRewriteMiddleware( options, next, siteSlug ) );

		apiFetch.use( ( options, next ) => pathRewriteMiddleware( options, next, siteSlug ) );

		apiFetch.use( apiFetch.createRootURLMiddleware( 'https://public-api.wordpress.com/' ) );

		this.setState( { hasMiddleware: true } );
	};

	render() {
		return this.state.hasMiddleware ? this.props.children : null;
	}
}
