import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { shuffle } from 'lodash';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { ReaderSitesList } from 'calypso/reader/sites-list';

function RecommendedBlogs( { userLogin, closeCard } ) {
	const translate = useTranslate();
	const { data: recommendedBlogs } = useFeedRecommendationsQuery( userLogin, {
		enabled: !! userLogin,
	} );
	const recommendedBlogsPath = `/reader/users/${ userLogin }/recommended-blogs`;
	const shouldShowRecommendedBlogs = recommendedBlogs?.length && userLogin;

	const handleViewAllClick = ( e ) => {
		e.preventDefault();
		closeCard();
		page( recommendedBlogsPath );
	};

	if ( ! shouldShowRecommendedBlogs ) {
		return null;
	}

	return (
		<div className="gravatar-hovercard__recommended-blogs">
			<div className="gravatar-hovercard__recommended-blogs-header">
				<h5 className="gravatar-hovercard__recommended-blogs-title">
					{ translate( 'Recommended blogs' ) }
				</h5>
				<a
					className="gravatar-hovercard__recommended-blogs-view-all"
					href={ recommendedBlogsPath }
					onClick={ handleViewAllClick }
				>
					{ translate( 'View all' ) }
				</a>
			</div>
			<ReaderSitesList
				sites={ shuffle( recommendedBlogs ).slice( 0, 3 ) }
				followSource="gravatar-hovercard__recommended-feeds-list"
				variant="compact"
			/>
		</div>
	);
}

export default RecommendedBlogs;
