/* eslint-disable no-restricted-imports */
import SupportArticleHeader from 'calypso/blocks/support-article-dialog/header';
import EmbedContainer from 'calypso/components/embed-container';
import HelpCenterFeedbackForm from './help-center-feedback-form';
import Placeholders from './placeholder-lines';

import './help-center-article-content.scss';

interface ArticleContentProps {
	content: string;
	title: string;
	link: string;
	isLoading?: boolean;
}

const ArticleContent = ( { content, title, link, isLoading = false }: ArticleContentProps ) => {
	const post = { title: title, url: link };
	return (
		<article className="help-center-article-content__story">
			{ isLoading ? (
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
						<HelpCenterFeedbackForm />
					</EmbedContainer>
				</>
			) }
		</article>
	);
};

export default ArticleContent;
