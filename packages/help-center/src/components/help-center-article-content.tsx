/* eslint-disable no-restricted-imports */
import { EmbedContainer } from '@automattic/components';
import { ArticleContentProps } from '../types';
import HelpCenterFeedbackForm from './help-center-feedback-form';
import { SupportArticleHeader } from './help-center-support-article-header';
import Placeholders from './placeholder-lines';
import './help-center-article-content.scss';

const ArticleContent = ( {
	content = '',
	title = '',
	link = '',
	postId,
	blogId,
	isLoading = false,
	slug,
	articleUrl,
}: ArticleContentProps ) => {
	const post = { title, link };
	return (
		<article className="help-center-article-content__story">
			{ isLoading || ! post ? (
				<Placeholders lines={ 8 } />
			) : (
				<>
					<SupportArticleHeader post={ post } isLoading={ false } />
					<EmbedContainer>
						<div
							className="help-center-article-content__story-content"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: content } }
						/>
						<HelpCenterFeedbackForm
							postId={ postId }
							blogId={ blogId }
							slug={ slug }
							articleUrl={ articleUrl }
						/>
					</EmbedContainer>
				</>
			) }
		</article>
	);
};

export default ArticleContent;
