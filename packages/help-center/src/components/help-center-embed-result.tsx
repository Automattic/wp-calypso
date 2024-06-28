/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { BackButton } from './back-button';
import { BackToTopButton } from './back-to-top-button';
import ArticleFetchingContent from './help-center-article-fetching-content';

export const HelpCenterEmbedResult: React.FC = () => {
	const { search } = useLocation();
	const navigate = useNavigate();
	const { sectionName } = useHelpCenterContext();

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
		recordTracksEvent( `calypso_inlinehelp_navigate_back`, {
			result_url: link,
			post_id: postId,
			blog_id: blogId,
			search_query: query,
		} );
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
			<div className="help-center-embed-result__header">
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
			</div>
			<div className="help-center-embed-result">
				<ArticleFetchingContent articleUrl={ link } postId={ +( postId || 0 ) } blogId={ blogId } />
			</div>
			<BackToTopButton />
		</>
	);
};
