import './styles.scss';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { shuffle } from 'lodash';
import { useMemo } from 'react';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { RecommendedFeedsList } from 'calypso/reader/recommended-feeds-list';

interface RecommendedBlogsProps {
	userLogin?: string;
	onCloseCard: () => void;
}

function RecommendedBlogs( { userLogin, onCloseCard }: RecommendedBlogsProps ): JSX.Element | null {
	const translate = useTranslate();
	const { data: recommendedBlogs } = useFeedRecommendationsQuery( userLogin, {
		enabled: !! userLogin,
	} );
	const recommendedBlogsPath = `/reader/users/${ userLogin }/recommended-blogs`;
	const shouldShowRecommendedBlogs = recommendedBlogs?.length && userLogin;
	const shuffledBlogs = useMemo(
		() => shuffle( recommendedBlogs ).slice( 0, 3 ),
		[ recommendedBlogs ]
	);

	const handleViewAllClick = ( e: React.MouseEvent< HTMLAnchorElement > ): void => {
		e.preventDefault();
		onCloseCard();
		page( recommendedBlogsPath );
	};

	if ( ! shouldShowRecommendedBlogs ) {
		return null;
	}

	return (
		<div className="user-hovercard__recommended-blogs">
			<div className="user-hovercard__recommended-blogs-header">
				<h5 className="user-hovercard__recommended-blogs-title">
					{ translate( 'Recommended blogs' ) }
				</h5>
				<a
					className="user-hovercard__recommended-blogs-view-all"
					href={ recommendedBlogsPath }
					onClick={ handleViewAllClick }
				>
					{ translate( 'View all' ) }
				</a>
			</div>
			<RecommendedFeedsList
				feeds={ shuffledBlogs }
				followSource="user-hovercard__recommended-feeds-list"
				variant="compact"
			/>
		</div>
	);
}

export default RecommendedBlogs;
