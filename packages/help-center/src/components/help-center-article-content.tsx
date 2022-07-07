/* eslint-disable no-restricted-imports */
import SupportArticleHeader from 'calypso/blocks/support-article-dialog/header';
import EmbedContainer from 'calypso/components/embed-container';

// import './style.scss';
import './help-center-article-content.scss';

interface ArticleContent {
	content: string;
	title: string;
	link: string;
}

const ArticleContent = ( { content, title, link }: ArticleContent ) => {
	const post = { title: title, url: link };
	return (
		<>
			<article className="help-center-article-content__story">
				<SupportArticleHeader post={ post } isLoading={ false } />
				{ /*eslint-disable react/no-danger */ }
				<EmbedContainer>
					<div
						className="help-center-article-content__story-content"
						dangerouslySetInnerHTML={ { __html: content } }
					/>
				</EmbedContainer>
				{ /*eslint-enable react/no-danger */ }
			</article>
		</>
	);
};

export default ArticleContent;
