import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useEffect, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, external } from '@wordpress/icons';
import { useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByUrl } from '../hooks';
import { BackButtonHeader } from './back-button';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

import './help-center-article.scss';

const ExternalLink = ( { href }: { href?: string } ) => {
	if ( ! href ) {
		return null;
	}

	return (
		<Button href={ href } target="_blank" className="help-center-article__external-button">
			<Icon icon={ external } size={ 20 } />
		</Button>
	);
};

export const HelpCenterArticle = () => {
	const [ searchParams ] = useSearchParams();
	const { sectionName } = useHelpCenterContext();

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

	return (
		<div className="help-center-article">
			<BackButtonHeader className="help-center-article__header">
				<ExternalLink href={ post?.URL } />
			</BackButtonHeader>
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
