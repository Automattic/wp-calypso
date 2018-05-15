/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import EmbedContainer from 'components/embed-container';
import SupportArticleHeader from 'blocks/inline-help/inline-help-support-article/header';
import Placeholders from 'blocks/inline-help/inline-help-support-article/placeholders';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderPost from 'components/data/query-reader-post';
import Emojify from 'components/emojify';
import { getPostByKey } from 'state/reader/posts/selectors';
import QueryPostLikes from 'components/data/query-post-likes';

export class FullPostView extends React.Component {
	static propTypes = {
		post: PropTypes.object,
	};

	render() {
		const { post, site, blogId, postId } = this.props;
		const isLoading = ! post;
		const postKey = { blogId, postId };

		/*eslint-disable react/no-danger */
		return (
			<div className="inline-help-support-article">
				{ site && <QueryPostLikes siteId={ post.site_ID } postId={ post.ID } /> }
				{ post && post.site_ID && <QueryReaderSite siteId={ +post.site_ID } /> }
				{ isLoading && <QueryReaderPost postKey={ postKey } /> }
				<div className="inline-help-support-article__content">
					<Emojify>
						<article className="inline-help-support-article__story">
							<SupportArticleHeader post={ post } isLoading={ isLoading } />
							{ isLoading ? (
								<Placeholders />
							) : (
								<EmbedContainer>
									<div
										className="inline-help-support-article__story-content"
										dangerouslySetInnerHTML={ { __html: post.content } }
									/>
								</EmbedContainer>
							) }
						</article>
					</Emojify>
				</div>
			</div>
		);
		/*eslint-enable react/no-danger */
	}
}

export default connect( ( state, { blogId, postId } ) => {
	const post = getPostByKey( state, { blogId, postId } );
	const siteId = get( post, 'site_ID' );
	const site = siteId && getSite( state, siteId );

	return {
		post,
		site,
	};
} )( FullPostView );
