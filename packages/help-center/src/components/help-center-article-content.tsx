import { useRef, useEffect } from '@wordpress/element';
/* eslint-disable no-restricted-imports */
import SupportArticleHeader from 'calypso/blocks/support-article-dialog/header';
import EmbedContainer from 'calypso/components/embed-container';
import Placeholders from './placeholder-lines';

// import './style.scss';
import './help-center-article-content.scss';

interface ArticleContentProps {
	content: string;
	title: string;
	link: string;
	isLoading?: boolean;
}

interface ContentWithExternalLinks {
	content: string;
	className?: string;
}

const ContentWithExternalLinks = ( { content, className }: ContentWithExternalLinks ) => {
	const contentRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( contentRef.current && content.length ) {
			contentRef.current.innerHTML = content;
			const externalLinks = contentRef.current.querySelectorAll( 'a[href*="http"]' );
			externalLinks.forEach( ( l ) => l.setAttribute( 'target', '_blank' ) );
		}
	}, [ contentRef, content ] );

	return <div ref={ contentRef } className={ className } />;
};

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
						<ContentWithExternalLinks
							className="help-center-article-content__story-content"
							content={ content }
						/>
					</EmbedContainer>
				</>
			) }
		</article>
	);
};

export default ArticleContent;
