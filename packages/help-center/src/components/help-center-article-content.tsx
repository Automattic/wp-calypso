/* eslint-disable no-restricted-imports */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import SupportArticleHeader from 'calypso/blocks/support-article-dialog/header';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import EmbedContainer from 'calypso/components/embed-container';
import useSupportArticleAlternatesQuery from 'calypso/data/support-article-alternates/use-support-article-alternates-query';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import Placeholders from './placeholder-lines';

// import './style.scss';
import './help-center-article-content.scss';

const getPostKey = ( blogId: number, postId: number ) => ( { blogId, postId } );

const useSupportArticleAlternatePostKey = ( blogId: number, postId: number ) => {
	const supportArticleAlternates = useSupportArticleAlternatesQuery( blogId, postId );
	if ( supportArticleAlternates.isLoading ) {
		return null;
	}

	if ( ! supportArticleAlternates.data ) {
		return getPostKey( blogId, postId );
	}

	return getPostKey( supportArticleAlternates.data.blog_id, supportArticleAlternates.data.page_id );
};

interface ArticleContent {
	postId: number;
	blogId?: string | null;
	articleUrl?: string;
}

const ArticleContent = ( { postId, blogId, articleUrl }: ArticleContent ) => {
	const postKey = useSupportArticleAlternatePostKey( +( blogId ?? SUPPORT_BLOG_ID ), postId );
	const post = useSelector( ( state ) => getPostByKey( state, postKey ) );
	const isLoading = ! post || ! postKey;
	const siteId = post?.site_ID;
	const shouldQueryReaderPost = ! post && postKey;

	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if (
			typeof window !== 'undefined' &&
			articleUrl &&
			articleUrl.indexOf( '#' ) !== -1 &&
			post?.content
		) {
			setTimeout( () => {
				const anchorId = articleUrl.split( '#' ).pop();
				if ( anchorId ) {
					const element = document.getElementById( anchorId );
					if ( element ) {
						element.scrollIntoView();
					}
				}
			}, 0 );
		}
	}, [ articleUrl, post ] );

	return (
		<>
			{ siteId && <QueryReaderSite siteId={ +siteId } /> }
			{ shouldQueryReaderPost && <QueryReaderPost postKey={ postKey } isHelpCenter /> }
			<article className="help-center-article-content__story">
				<SupportArticleHeader post={ post } isLoading={ isLoading } />
				{
					isLoading ? (
						<Placeholders />
					) : (
						/*eslint-disable react/no-danger */

						<EmbedContainer>
							<div
								className="help-center-article-content__story-content"
								dangerouslySetInnerHTML={ { __html: post?.content } }
							/>
						</EmbedContainer>
					)
					/*eslint-enable react/no-danger */
				}
			</article>
		</>
	);
};

export default ArticleContent;
