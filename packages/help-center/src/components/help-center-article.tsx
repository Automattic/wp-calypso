/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByKey, useSupportArticleAlternatePostKey } from '../hooks';
import { BackButton } from './back-button';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

export const HelpCenterArticle: React.FC = () => {
	const { search, key } = useLocation();
	const navigate = useNavigate();
	const { sectionName } = useHelpCenterContext();

	const params = new URLSearchParams( search );
	const postId = Number( params.get( 'postId' ) );
	const blogId = params.get( 'blogId' ) ?? undefined;
	const articleUrl = params.get( 'link' ) ?? undefined;
	const query = params.get( 'query' );
	const postKey = useSupportArticleAlternatePostKey( blogId, postId );
	const post = usePostByKey( postKey ).data;
	const isLoading = ! post?.content || ! postKey;

	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if ( articleUrl && articleUrl.indexOf( '#' ) !== -1 && post?.content ) {
			setTimeout( () => {
				const anchorId = articleUrl.split( '#' ).pop();
				if ( anchorId ) {
					const element = document.getElementById( anchorId );
					if ( element ) {
						element.scrollIntoView();
					}
				}
			}, 0 );
		}
	}, [ articleUrl, post ] );

	useEffect( () => {
		const tracksData = {
			search_query: query,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			result_url: articleUrl,
			post_id: postId,
			blog_id: blogId,
		};

		recordTracksEvent( `calypso_inlinehelp_article_open`, tracksData );
	}, [ query, articleUrl, sectionName, postId, blogId ] );

	const redirectBack = () => {
		recordTracksEvent( `calypso_inlinehelp_navigate_back`, {
			result_url: articleUrl,
			post_id: postId,
			blog_id: blogId,
			search_query: query,
		} );
		if ( key === 'default' ) {
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
			result_url: articleUrl,
			post_id: postId,
			blog_id: blogId,
		};

		recordTracksEvent( `calypso_inlinehelp_article_click_external_link`, tracksData );
	};

	return (
		<>
			<div className="help-center-article__header">
				<Flex justify="space-between">
					<FlexItem>
						<BackButton onClick={ redirectBack } />
					</FlexItem>
					<FlexItem>
						<Button
							href={ articleUrl }
							target="_blank"
							onClick={ recordTracksAndRedirect }
							className="help-center-article__external-button"
						>
							<Icon icon={ external } size={ 20 } />
						</Button>
					</FlexItem>
				</Flex>
			</div>
			<div className="help-center-article">
				<ArticleContent
					content={ post?.content }
					title={ post?.title }
					link={ post?.link }
					isLoading={ isLoading }
					postId={ postId }
					blogId={ blogId }
					slug={ post?.slug }
					articleUrl={ articleUrl }
				/>{ ' ' }
			</div>
			<BackToTopButton />
		</>
	);
};
