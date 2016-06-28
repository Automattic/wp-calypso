/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const PostPlaceholder = React.createClass( {

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<Card tagName="article" className="reader__card is-placeholder">

				<div className="reader__post-header">
					<h1 className="reader__post-title"><a className="reader__post-title-link" target="_blank"><span className="reader__placeholder-text">Loading interesting posts…</span></a></h1>
					<div className="reader__post-byline">
						<span className="site-icon" height="16" width="16"></span>
						<h4 className="reader__site-name"><span className="reader__placeholder-text">Loading Sites</span></h4>
						<time className="reader__post-time" ><span className="reader__placeholder-text">10 min</span></time>
					</div>
				</div>

				<div className="reader__post-excerpt"><p><span className="reader__placeholder-text">Please wait while we grab all the interesting posts, photos, videos and more to show you in Reader. It shouldn&rsquo;t take long.</span></p></div>

				<ul className="reader__post-footer">
					<li className="reader__post-read-time"><span className="reader__placeholder-text">10 min read</span></li>
				</ul>
			</Card>
		);
	}

} );

export default PostPlaceholder;
