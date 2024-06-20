/* eslint-disable no-restricted-imports */
import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from 'react';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import useSupportArticleAlternatesQuery from 'calypso/data/support-article-alternates/use-support-article-alternates-query';
import { usePostByKey } from '../hooks/use-post-by-key';
import ArticleContent from './help-center-article-content';
// import './style.scss';
import './help-center-article-content.scss';

const getPostKey = ( blogId: number, postId: number ) => ( { blogId, postId } );

const useSupportArticleAlternatePostKey = ( blogId: number, postId: number ) => {
	const locale = useLocale();
	const supportArticleAlternates = useSupportArticleAlternatesQuery( blogId, postId, locale );
	if ( supportArticleAlternates.isInitialLoading ) {
		return null;
	}

	if ( ! supportArticleAlternates.data ) {
		return getPostKey( blogId, postId );
	}

	return getPostKey( supportArticleAlternates.data.blog_id, supportArticleAlternates.data.page_id );
};

interface ArticleFetchingContentProps {
	postId: number;
	blogId?: string | null;
	articleUrl?: string | null;
}

const ArticleFetchingContent = ( { postId, blogId, articleUrl }: ArticleFetchingContentProps ) => {
	const postKey = useSupportArticleAlternatePostKey( +( blogId ?? SUPPORT_BLOG_ID ), postId );
	const post = usePostByKey( postKey ).data;
	const isLoading = ! post?.content || ! postKey;
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
			<ArticleContent
				content={ post?.content }
				title={ post?.title }
				link={ post?.link }
				isLoading={ isLoading }
				postId={ postId }
				blogId={ blogId }
				slug={ post?.slug }
			/>
		</>
	);
};

export default ArticleFetchingContent;
