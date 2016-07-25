/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import ReaderFullPostHeader from 'components/reader-full-post-header';

module.exports = React.createClass( {
	displayName: 'ReaderFullPostHeader',

	mixins: [ PureRenderMixin ],

	render() {
		const post = {
			title: 'Spring Harvest 2016',
			URL: 'http://wordpress.com'
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/reader-full-post-header">Reader Full Post Header</a>
				</h2>

				<ReaderFullPostHeader post={ post } />
			</div>
		);
	}
} );
