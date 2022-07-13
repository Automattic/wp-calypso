/* eslint-disable no-restricted-imports */
import SupportArticleHeader from 'calypso/blocks/support-article-dialog/header';
import EmbedContainer from 'calypso/components/embed-container';
import Placeholders from './placeholder-lines';

// import './style.scss';
import './help-center-article-content.scss';

interface ArticleContent {
	content: string;
	title: string;
	link: string;
	isLoading?: boolean;
}

const ArticleContent = ( { content, title, link, isLoading = false }: ArticleContent ) => {
	const post = { title: title, url: link };
	return (
		<article className="help-center-article-content__story">
			{
				isLoading ? (
					<Placeholders lines={ 8 } />
				) : (
					/*eslint-disable react/no-danger */
					<>
						<SupportArticleHeader post={ post } isLoading={ false } />
						<EmbedContainer>
							<div
								className="help-center-article-content__story-content"
								dangerouslySetInnerHTML={ { __html: content } }
							/>
						</EmbedContainer>
					</>
				)
				/*eslint-enable react/no-danger */
			}
		</article>
	);
};

export default ArticleContent;
