import './styles.scss';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { shuffle } from 'lodash';
import { useMemo } from 'react';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { ReaderSitesList } from 'calypso/reader/sites-list';

interface RecommendedBlogsProps {
	userLogin?: string;
}

function RecommendedBlogs( { userLogin }: RecommendedBlogsProps ): JSX.Element | null {
	const translate = useTranslate();
	const { isLoading, data: recommendedBlogs } = useFeedRecommendationsQuery( userLogin );
	const shuffledBlogs = useMemo(
		() =>
			shuffle( recommendedBlogs )
				.filter( ( blog ) => blog.feedUrl )
				.slice( 0, 3 ),
		[ recommendedBlogs ]
	);

	return (
		<div className="user-hovercard__recommended-blogs">
			<div className="user-hovercard__recommended-blogs-header">
				<h5 className="user-hovercard__recommended-blogs-title">
					{ translate( 'Recommended blogs' ) }
				</h5>
				<a
					className="user-hovercard__recommended-blogs-view-all"
					href={ `/reader/users/${ userLogin }/recommended-blogs` }
				>
					{ translate( 'View all' ) }
				</a>
			</div>

			{ isLoading ? (
				<div className="wp-spinner-wrapper" style={ { marginTop: '10px' } }>
					<Spinner />
				</div>
			) : (
				<ReaderSitesList
					sites={ shuffledBlogs }
					followSource="user-hovercard__recommended-sites-list"
					variant="compact"
					siteIconSize={ 30 }
				/>
			) }
		</div>
	);
}

export default RecommendedBlogs;
