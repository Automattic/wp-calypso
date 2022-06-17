import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports
import ArticleContent from 'calypso/blocks/support-article-dialog/dialog-content';
import { BackButton } from './back-button';

export const HelpCenterEmbedResult: React.FC = () => {
	const { search } = useLocation();
	const history = useHistory();
	const params = new URLSearchParams( search );
	const postId = params.get( 'postId' );
	const blogId = params.get( 'blogId' );
	const query = params.get( 'query' );
	const link = params.get( 'link' );

	useEffect( () => {
		const tracksData = {
			search_query: query,
			location: 'inline-help-popover',
			result_url: link,
		};

		recordTracksEvent( `calypso_inlinehelp_article_open`, tracksData );
	}, [ query, link ] );

	const redirectToSearchOrHome = () => {
		if ( query ) {
			const search = new URLSearchParams( {
				query,
			} ).toString();
			history.push( `/?${ search }` );
		} else {
			history.push( '/' );
		}
	};

	return (
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
			<ArticleContent postId={ postId } blogId={ blogId } articleUrl={ null } />
		</div>
	);
};
