import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, createInterpolateElement, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByUrl } from '../hooks';
import { useHelpCenterArticleScroll } from '../hooks/use-help-center-article-scroll';
import { useHelpCenterArticleTabComponent } from '../hooks/use-help-center-article-tab-component';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

import './help-center-article.scss';

export const HelpCenterArticle = () => {
	const [ searchParams ] = useSearchParams();
	const { sectionName } = useHelpCenterContext();
	const postUrl = searchParams.get( 'link' ) || '';
	const query = searchParams.get( 'query' );

	const elementRef = useRef< HTMLDivElement | null >( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );

	useEffect( () => {
		if ( elementRef.current ) {
			scrollParentRef.current = elementRef.current?.closest( '.help-center__container-content' );
		}
	}, [ elementRef ] );

	const { data: post, isLoading, error } = usePostByUrl( postUrl );
	useHelpCenterArticleTabComponent( post?.content );
	useHelpCenterArticleScroll( post?.ID, scrollParentRef );
	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if ( postUrl?.includes( '#' ) && post?.content ) {
			setTimeout( () => {
				const anchorId = postUrl.split( '#' ).pop();
				if ( anchorId ) {
					const element = document.getElementById( anchorId );
					if ( element ) {
						element.scrollIntoView();
					}
				}
			}, 0 );
		}
	}, [ postUrl, post ] );

	useEffect( () => {
		if ( post ) {
			const tracksData = {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
				result_url: post.URL,
				post_id: post.ID,
				blog_id: post.site_ID,
			};

			query
				? recordTracksEvent( 'calypso_helpcenter_search_result_article_viewed', {
						...tracksData,
						search_query: query,
				  } )
				: recordTracksEvent( 'calypso_helpcenter_article_viewed', tracksData );
		}
	}, [ post, query, sectionName ] );

	// Trigger event for each section scrolled into view
	useEffect( () => {
		if ( elementRef.current ) {
			const observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							const tracksData = {
								force_site_id: true,
								location: 'help-center',
								post_url: post?.URL,
								post_id: post?.ID,
								blog_id: post?.site_ID,
								section_id: entry?.target?.id,
							};
							recordTracksEvent( 'calypso_helpcenter_article_section_view', tracksData );
							observer.unobserve( entry.target ); // Unobserve after first intersection
						}
					} );
				},
				{ threshold: 0.1 }
			);

			const h2Elements = elementRef.current.querySelectorAll( 'h2' );
			h2Elements.forEach( ( h2 ) => observer.observe( h2 ) );

			return () => {
				observer.disconnect();
			};
		}
	}, [ elementRef, post?.ID, post?.URL, post?.site_ID ] );

	return (
		<div className="help-center-article" ref={ elementRef }>
			{ ! error && <ArticleContent post={ post } isLoading={ isLoading } /> }
			{ ! isLoading && error && (
				<p className="help-center-article__error">
					{ createInterpolateElement(
						__(
							"Sorry, we couldn't load that article. <url>Click here</url> to open it in a new tab",
							__i18n_text_domain__
						),
						{
							url: <a target="_blank" rel="noopener noreferrer" href={ postUrl } />,
						}
					) }
				</p>
			) }
			<BackToTopButton />
		</div>
	);
};
