// External dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import Gravatar from 'components/gravatar';
import PostExcerpt from 'components/post-excerpt';
import { decodeEntities } from 'lib/formatting';
import page from 'page';
import { getPostBySiteAndId } from 'state/reader/posts/selectors';

const StartPostPreview = React.createClass( {
	getFullPostUrl() {
		const post = this.props.post;
		if ( post.feed_ID && post.feed_item_ID ) {
			return '/read/feeds/' + post.feed_ID + '/posts/' + post.feed_item_ID;
		}
		return '/read/blogs/' + post.site_ID + '/posts/' + post.ID;
	},

	showFullPost( event ) {
		event.preventDefault();
		page.show( this.getFullPostUrl() );
	},

	render() {
		const post = this.props.post;
		return (
			<article className="reader-start-post-preview">
				<h1><a href={ this.getFullPostUrl() } onClick={ this.showFullPost }>{ decodeEntities( post.title ) }</a></h1>
				<div className="reader-start-post-preview__byline">
					<Gravatar user={ post.author } size={ 20 } />
					<span className="reader-start-post-preview__author">by { decodeEntities( post.author.name ) }</span>
				</div>
				<PostExcerpt maxLength={ 160 } content={ post.excerpt } />
			</article>
		);
	}
} );

StartPostPreview.propTypes = {
	siteId: React.PropTypes.number.isRequired,
	postId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			post: getPostBySiteAndId( state, ownProps.siteId, ownProps.postId )
		};
	}
)( StartPostPreview );
