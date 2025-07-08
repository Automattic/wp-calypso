import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { shuffle } from 'lodash';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUserRecommendedBlogs } from 'calypso/state/reader/lists/actions';
import { getUserRecommendedBlogs } from 'calypso/state/reader/lists/selectors';
import RecommendedBlogItem from './item';

function RecommendedBlogs( { userLogin, closeCard } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const recommendedBlogs = useSelector( ( state ) => getUserRecommendedBlogs( state, userLogin ) );
	const recommendedBlogsPath = `/reader/users/${ userLogin }/recommended-blogs`;

	const shouldShowRecommendedBlogs =
		isEnabled( 'reader/recommended-blogs-list' ) && recommendedBlogs?.length && userLogin;

	useEffect( () => {
		if ( ! recommendedBlogs && userLogin ) {
			dispatch( requestUserRecommendedBlogs( userLogin ) );
		}
	}, [ userLogin, recommendedBlogs, dispatch ] );

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
						<RecommendedBlogItem
							key={ blog.ID }
							blog={ blog }
							classPrefix="gravatar-hovercard"
							compact
							onLinkClick={ closeCard }
						/>
					) ) }
			</ul>
		</div>
	);
}

export default RecommendedBlogs;
