import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { shuffle } from 'lodash';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { RecommendedFeed } from 'calypso/reader/recommended-feed';

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
			<ul className="gravatar-hovercard__recommended-blogs-list">
				{ shuffle( recommendedBlogs )
					.slice( 0, 3 )
					.map( ( blog ) => (
						<li key={ blog.ID }>
							<RecommendedFeed
								key={ blog.ID }
								blog={ blog }
								classPrefix="gravatar-hovercard"
								compact
								onLinkClick={ closeCard }
							/>
						</li>
					) ) }
			</ul>
		</div>
	);
}

export default RecommendedBlogs;
