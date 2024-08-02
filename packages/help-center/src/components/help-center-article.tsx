import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import { useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { usePostByUrl } from '../hooks';
import { BackButton } from './back-button';
import { BackToTopButton } from './back-to-top-button';
import ArticleContent from './help-center-article-content';

export const HelpCenterArticle = () => {
	const [ searchParams ] = useSearchParams();
	const { sectionName } = useHelpCenterContext();

	const postUrl = searchParams.get( 'link' ) || '';
	const query = searchParams.get( 'query' );

	const { data: post, isLoading } = usePostByUrl( postUrl );

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
		<>
			<div className="help-center-article__header">
				<Flex justify="space-between">
					<FlexItem>
						<BackButton />
					</FlexItem>
					<FlexItem>
						<Button
							href={ post?.URL }
							target="_blank"
							className="help-center-article__external-button"
						>
							<Icon icon={ external } size={ 20 } />
						</Button>
					</FlexItem>
				</Flex>
			</div>
			<div className="help-center-article">
				<ArticleContent post={ post } isLoading={ isLoading } />
			</div>
			<BackToTopButton />
		</>
	);
};
