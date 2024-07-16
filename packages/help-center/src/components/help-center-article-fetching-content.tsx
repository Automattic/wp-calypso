/* eslint-disable no-restricted-imports */
import { useEffect } from 'react';
import { usePostByKey } from '../hooks/use-post-by-key';
import { useSupportArticleAlternatePostKey } from '../hooks/use-support-article-alternates-query';
import ArticleContent from './help-center-article-content';
import './help-center-article-content.scss';

interface ArticleFetchingContentProps {
	postId: number;
	blogId?: string | undefined;
	articleUrl?: string | null;
}

const ArticleFetchingContent = ( { postId, blogId, articleUrl }: ArticleFetchingContentProps ) => {
	const postKey = useSupportArticleAlternatePostKey( blogId, postId );
	const post = usePostByKey( postKey ).data;
	const isLoading = ! post?.content || ! postKey;

	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if ( articleUrl && articleUrl.indexOf( '#' ) !== -1 && post?.content ) {
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
			<ArticleContent
				content={ post?.content }
				title={ post?.title }
				link={ post?.link }
				isLoading={ isLoading }
				postId={ postId }
				blogId={ blogId }
				slug={ post?.slug }
				articleUrl={ articleUrl }
			/>
		</>
	);
};

export default ArticleFetchingContent;
