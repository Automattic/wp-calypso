/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { getSectionName } from 'calypso/state/ui/selectors';
import { BackButton } from './back-button';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';
import ArticleFetchingContent from './help-center-article-fetching-content';

export const HelpCenterEmbedResult: React.FC = () => {
	const { state, search } = useLocation();
	const history = useHistory();
	const sectionName = useSelector( getSectionName );

	const params = new URLSearchParams( search );
	const postId = params.get( 'postId' );
	const blogId = params.get( 'blogId' );
	const canNavigateBack = params.get( 'canNavigateBack' ) === 'true';
	const link = params.get( 'link' );
	const query = params.get( 'query' );

	useEffect( () => {
		const tracksData = {
			search_query: query,
			location: 'help-center',
			section: sectionName,
			result_url: link,
		};

		recordTracksEvent( `calypso_inlinehelp_article_open`, tracksData );
	}, [ query, link, sectionName ] );

	const redirectToSearchOrHome = () => {
		if ( canNavigateBack ) {
			history.goBack();
		} else if ( query ) {
			history.push( `/?query=${ query }` );
		} else {
			history.push( '/' );
		}
	};

	return (
		<>
			<div className="help-center-embed-result">
				<Flex justify="space-between">
					<FlexItem>
						<BackButton onClick={ redirectToSearchOrHome } />
					</FlexItem>
					<FlexItem>
						<Button
							borderless={ true }
							href={ link ?? '' }
							target="_blank"
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
