import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByUrl } from '../hooks';
import { useHelpCenterArticleTabComponent } from '../hooks/use-help-center-article-tab-component';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

import './help-center-article.scss';

export const HelpCenterArticle = () => {
	const [ searchParams ] = useSearchParams();
	const { sectionName } = useHelpCenterContext();
	const postUrl = searchParams.get( 'link' ) || '';
	const query = searchParams.get( 'query' );

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
