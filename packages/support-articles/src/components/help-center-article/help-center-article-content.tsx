import { EmbedContainer } from '@automattic/components';
import { useState, useCallback } from '@wordpress/element';
import { useContentFilter } from '../../hooks/use-content-filter';
import HelpCenterFeedbackForm from '../help-center-feedback-form';
import Placeholders from '../placeholder-lines';
import { ArticleLessonNavigation } from './article-lesson-navigation';
import { SupportArticleHeader } from './help-center-support-article-header';
import type { ArticleContentProps } from '../../types';

const ArticleContent = ( {
	post,
	isLoading,
	currentSiteDomain,
	isEligibleForChat,
	forceEmailSupport,
}: ArticleContentProps ) => {
	const [ theRef, setTheRef ] = useState< HTMLDivElement | null >( null );
	const articleContentRef = useCallback( ( node: HTMLDivElement | null ) => setTheRef( node ), [] );

	useContentFilter( theRef, currentSiteDomain || '' );

	return (
		<article className="help-center-article-content">
			{ isLoading || ! post ? (
				<Placeholders lines={ 8 } />
			) : (
				<>
					<SupportArticleHeader post={ post } isLoading={ false } />
					<EmbedContainer>
						<div
							className={
								post.lesson_navigation
									? 'help-center-article-content__main help-center-article-content__main--with-lesson-navigation'
									: 'help-center-article-content__main'
							}
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: post.content } }
							ref={ articleContentRef }
						/>
						<HelpCenterFeedbackForm
							postId={ post.ID }
							isEligibleForChat={ isEligibleForChat }
							forceEmailSupport={ forceEmailSupport }
						/>
						{ post.lesson_navigation && (
							<ArticleLessonNavigation lessonNavigation={ post.lesson_navigation } />
						) }
					</EmbedContainer>
				</>
			) }
		</article>
	);
};

export default ArticleContent;
