import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, createInterpolateElement, useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByUrl } from '../hooks';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

import './help-center-article.scss';

export const HelpCenterArticle = () => {
	const [ searchParams ] = useSearchParams();
	const { sectionName } = useHelpCenterContext();
	const location = useLocation();
	const navigate = useNavigate();
	const [ tabHash, setTabHash ] = useState( '' );
	const postUrl = searchParams.get( 'link' ) || '';
	const query = searchParams.get( 'query' );

	const { data: post, isLoading, error } = usePostByUrl( postUrl );

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

	const toggleTab = ( element: Element, show: boolean ) => {
		( element as HTMLElement ).style.display = show ? 'block' : 'none';
		element.setAttribute( 'aria-hidden', show ? 'false' : 'true' );
	};

	const toggleTabTitle = ( element: Element, show: boolean ) => {
		element.setAttribute( 'aria-selected', show ? 'true' : 'false' );
	};

	const activateTab = useCallback( () => {
		const hash = tabHash;

		const tabs = Array.from( document.querySelectorAll( '.wp-block-wpsupport3-tabs' ) );

		tabs.forEach( ( tab ) => {
			const titles = Array.from( tab.querySelectorAll( '.wpsupport3-tab__title' ) );
			const bodies = Array.from(
				tab.querySelectorAll( '.wp-block-wpsupport3-tab:not(.invisible_tabpanel)' )
			);

			const match = titles.findIndex( ( titles ) => titles.id === hash?.substring( 1 ) );

			// Reset selection
			titles.forEach( ( title ) => toggleTabTitle( title, false ) );
			bodies.forEach( ( body ) => toggleTab( body, false ) );

			if ( hash && match !== -1 ) {
				toggleTabTitle( titles[ match ], true );
				toggleTab( bodies[ match ], true );
			} else {
				// If the first tab is invisible from the editor, we set the first tab as active.
				toggleTabTitle( titles[ 0 ], true );
				toggleTab( bodies[ 0 ], true );
			}
		} );
	}, [ tabHash ] );

	useEffect( () => {
		if ( tabHash || post ) {
			activateTab();
		}
	}, [ activateTab, tabHash, post ] );

	useEffect( () => {
		if ( post ) {
			const titles = Array.from(
				document.querySelectorAll( '.wp-block-wpsupport3-tabs .wpsupport3-tab__title' )
			);
			titles.forEach( ( title ) => {
				title.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					setTabHash( `#${ title?.id }` );
					setTimeout( () => {
						window.scroll( 0, document.documentElement.scrollTop );
					} );
				} );
			} );
		}
	}, [ location.pathname, location.search, navigate, post ] );

	return (
		<div className="help-center-article">
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
