/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import config from 'config';

/**
 * Internal dependencies
 */
import Card from 'components/card';

var PostUnavailable = React.createClass( {

	mixins: [ PureRenderMixin ],

	componentWillMount: function() {
		this.errors = {
			unauthorized: this.translate( 'This is a post on a private site that you’re following, but not currently a member of. Please request membership to display these posts in Reader.' ),
			default: this.translate( 'An error occurred loading this post.' )
		};
	},

	render: function() {
		var errorMessage = this.errors[ this.props.post.errorCode || 'default' ] || this.errors.default;

		if ( this.props.post.statusCode === 404 ) {
			// don't render a card for 404s. These are posts that we once had but were deleted.
			return null;
		}

		return (
			<Card tagName="article" className="reader__card is-error">
				<div className="reader__post-header">
					<h1 className="reader__post-title"><a className="reader__post-title-link" target="_blank" rel="noopener noreferrer"><span className="reader__placeholder-text">Oops!</span></a></h1>
				</div>

				<div className="reader__post-excerpt">
					<p>{ errorMessage }</p>
					{ config.isEnabled( 'reader/full-errors' ) ? <pre>{ JSON.stringify( this.props.post, null, '  ' ) }</pre> : null }
					</div>
			</Card>
		);
	}

} );

export default PostUnavailable;
