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

	const embedResultHeaderHeight = document.querySelector( '.help-center-embed-result__header' )
		?.clientHeight;
	const embedResultContainer = document.querySelector( '.help-center-embed-result' );

	if ( content ) {
		// console.log( { content } );
		// parse content and find the first anchor link with a hash
		// cast firstAnchor to HTMLAnchorElement
		// if it exists, find the id with that hash and add scrollMarginTop: 69px to the first anchor link
		const parser = new DOMParser();
		const doc = parser.parseFromString( content, 'text/html' );
		const firstAnchor = doc.querySelector< HTMLElement >( 'a[href^="#"]' );
		if ( firstAnchor ) {
			const anchorId = firstAnchor.getAttribute( 'href' ) || '';
			// console.log( { anchorId } );
			const element = doc.querySelector< HTMLElement >( anchorId );
			console.log({element});
			if ( element ) {
				element.style.scrollMarginTop = `${ embedResultHeaderHeight }px`;
			}
		}
		content = doc.body.innerHTML;
	}

	const handleOnClick = ( event: React.MouseEvent ) => {
		console.log( { event } );
		// event.preventDefault();
		// If event target hash includes an anchor, let's scroll this into view!
		if ( event.target instanceof HTMLAnchorElement ) {
			const anchorId = event.target.hash.slice( 1 );
			const element = document.getElementById( anchorId );
			console.log( { anchorId, element } );
			if ( element && embedResultHeaderHeight ) {
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.scrollY - embedResultHeaderHeight;

				console.log( { elementPosition, offsetPosition } );
				event.preventDefault();
				setTimeout( () => {
					element.scrollIntoView();
				}, 0 );
				// window.scrollTo( 0, elementPosition );
				// window.scrollTo( { top: offsetPosition } );
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
						<div
							className="help-center-article-content__story-content"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: content } }
							onClick={ handleOnClick }
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
