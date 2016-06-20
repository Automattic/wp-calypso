// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import classNames from 'classnames';

// Internal dependencies
import Gravatar from 'components/gravatar';
import PostExcerpt from 'components/post-excerpt';
import page from 'page';
import { getPostBySiteAndId } from 'state/reader/posts/selectors';
import safeImageUrl from 'lib/safe-image-url';
import resizeImageUrl from 'lib/resize-image-url';

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
		if ( ! post ) {
			return null;
		}

		// Grab the post featured image
		const headerImageUrl = get( post, 'canonical_image.uri' );

		// Resize it with Photon
		let resizedHeaderImageUrl, heroStyle;
		if ( headerImageUrl ) {
			resizedHeaderImageUrl = resizeImageUrl( safeImageUrl( headerImageUrl ), { resize: '350,70' } );
			heroStyle = {
				backgroundImage: `url("${ resizedHeaderImageUrl }")`
			};
		}

		const hasExcerpt = post.excerpt.length > 0;
		const articleClasses = classNames( 'reader-start-post-preview', {
			'is-photo': ! hasExcerpt,
			'has-image': !! headerImageUrl
		} );

		return (
			<article className={ articleClasses }>
				<a href={ this.getFullPostUrl() } onClick={ this.showFullPost } className="reader-start-post-preview__featured-link">
					<div className="reader-start-post-preview__featured-label">Featured Post</div>
					<div className="reader-start-post-preview__featured-image is-dark" style={ heroStyle }></div>
				</a>
				<div className="reader-start-post-preview__post-content">
					<h1><a href={ this.getFullPostUrl() } onClick={ this.showFullPost } className="reader-start-post-preview__title">{ post.title }</a></h1>
					<div className="reader-start-post-preview__byline">
						<Gravatar user={ post.author } size={ 20 } />
						<span className="reader-start-post-preview__author">by { post.author.name }</span>
					</div>
					<PostExcerpt maxLength={ 160 } content={ post.excerpt } className="reader-start-post-preview__excerpt" />
				</div>
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
