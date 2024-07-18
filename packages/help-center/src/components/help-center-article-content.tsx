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

	const handleTableOfContentClick = ( event: React.MouseEvent ) => {
		// Check if the clicked element is a link
		if ( event.target instanceof HTMLAnchorElement ) {
			const url = event.target.getAttribute( 'href' );

			// Only target links with '#'
			if ( url && url.indexOf( '#' ) !== -1 ) {
				// Avoid app url changes
				event.preventDefault();
				setTimeout( () => {
					const anchorId = url.split( '#' ).pop();
					if ( anchorId ) {
						const element = document.getElementById( anchorId );
						if ( element ) {
							element.scrollIntoView();
						}
					}
				}, 0 );
			}
		}
	};

	return (
		<article className="help-center-article-content__story">
			{ isLoading || ! post ? (
				<Placeholders lines={ 8 } />
			) : (
				<>
					<SupportArticleHeader post={ post } isLoading={ false } />
					<EmbedContainer>
						{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */ }
						<div
							className="help-center-article-content__story-content"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: content } }
							onClick={ handleTableOfContentClick }
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
