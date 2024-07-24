/* eslint-disable no-restricted-imports */
import { EmbedContainer } from '@automattic/components';
import { ArticleContentProps } from '../types';
import HelpCenterFeedbackForm from './help-center-feedback-form';
import { SupportArticleHeader } from './help-center-support-article-header';
import Placeholders from './placeholder-lines';
import './help-center-article-content.scss';

const ArticleContent = ( { isLoading = false, post }: ArticleContentProps ) => {
	return (
		<article className="help-center-article-content">
			{ isLoading || ! post ? (
				<Placeholders lines={ 8 } />
			) : (
				<>
					<SupportArticleHeader post={ post } isLoading={ false } />
					<EmbedContainer>
						<div
							className="help-center-article-content__main"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: post.content } }
						/>
						<HelpCenterFeedbackForm
							postId={ post.ID }
							blogId={ post.site_ID }
							slug={ post.slug }
							articleUrl={ post.URL }
						/>
					</EmbedContainer>
				</>
			) }
		</article>
	);
};

export default ArticleContent;
