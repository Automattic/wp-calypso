import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, createInterpolateElement, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { debounce } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByUrl } from '../hooks';
import { useHelpCenterArticleTabComponent } from '../hooks/use-help-center-article-tab-component';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

import './help-center-article.scss';

/**
 * Persist the value in memory so when the element is unmounted it doesn't get lost.
 */
const cachedScrollPositions: Record< string, number > = {};

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

	useEffect( () => {
		if ( ! post?.ID || ! scrollParentRef?.current ) {
			return;
		}

		const scrollBehaviour = scrollParentRef.current.style.scrollBehavior;
		// temporary disable smooth scrolling
		scrollParentRef.current.style.scrollBehavior = 'auto';

		if ( cachedScrollPositions[ post.ID ] ) {
			scrollParentRef.current.scrollTop = cachedScrollPositions[ post.ID ];
		} else {
			scrollParentRef.current.scrollTop = 0;
		}

		// restore smooth scrolling
		scrollParentRef.current.style.scrollBehavior = scrollBehaviour;

		const handleScroll = debounce( ( event: { target: EventTarget | null } ) => {
			if ( event.target === scrollParentRef.current ) {
				cachedScrollPositions[ post.ID ] = Number( scrollParentRef.current?.scrollTop );
			}
		}, 250 );

		scrollParentRef.current.addEventListener( 'scroll', handleScroll );

		return () => {
			scrollParentRef.current?.removeEventListener( 'scroll', handleScroll );
		};
	}, [ post?.ID ] );

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
