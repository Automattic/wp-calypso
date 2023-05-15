/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSectionName } from 'calypso/state/ui/selectors';
import { BackButton } from './back-button';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';
import ArticleFetchingContent from './help-center-article-fetching-content';

export const HelpCenterEmbedResult: React.FC = () => {
	const { state, search } = useLocation();
	const navigate = useNavigate();
	const sectionName = useSelector( getSectionName );

	// eslint-disable-next-line no-console
	console.warn( 'got search', search );

	const params = new URLSearchParams( search );
	const postId = params.get( 'postId' );
	const blogId = params.get( 'blogId' );
	const canNavigateBack = params.get( 'canNavigateBack' ) === 'true';
	const link = params.get( 'link' );
	const query = params.get( 'query' );

	useEffect( () => {
		const tracksData = {
			search_query: query,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			result_url: link,
			post_id: postId,
			blog_id: blogId,
		};

		recordTracksEvent( `calypso_inlinehelp_article_open`, tracksData );
	}, [ query, link, sectionName, postId, blogId ] );

	const redirectBack = () => {
		if ( canNavigateBack ) {
			navigate( -1 );
		} else if ( query ) {
			navigate( `/?query=${ query }` );
		} else {
			navigate( '/' );
		}
	};

	const recordTracksAndRedirect = () => {
		const tracksData = {
			search_query: query,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			result_url: link,
			post_id: postId,
			blog_id: blogId,
		};

		recordTracksEvent( `calypso_inlinehelp_article_click_external_link`, tracksData );
	};

	return (
		<>
			<div className="help-center-embed-result">
				<Flex justify="space-between">
					<FlexItem>
						<BackButton onClick={ redirectBack } />
					</FlexItem>
					<FlexItem>
						<Button
							href={ link ?? '' }
							target="_blank"
							onClick={ recordTracksAndRedirect }
							className="help-center-embed-result__external-button"
						>
							<Icon icon={ external } size={ 20 } />
						</Button>
					</FlexItem>
				</Flex>
				{ state?.content ? (
					<ArticleContent content={ state.content } title={ state.title } link={ state.link } />
				) : (
					postId && <ArticleFetchingContent postId={ +postId } blogId={ blogId } />
				) }
			</div>
			<BackToTopButton />
		</>
	);
};
