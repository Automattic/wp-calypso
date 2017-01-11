/**
 * External dependencies
 **/
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Count from 'components/count';
import Gridicon from 'components/gridicon';
import Gravatar from 'components/gravatar';
import StatsModuleContent from '../stats-module/content-text';
import QueryPostLikes from 'components/data/query-post-likes';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';
import { isRequestingPostLikes, getPostLikes, countPostLikes } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

export const PostLikes = props => {
	const { countLikes, isRequesting, likes, opened, postId, siteId, toggle, translate } = props;
	const infoIcon = opened ? 'info' : 'info-outline';
	const isLoading = isRequesting && ! likes;
	const classes = {
		'is-showing-info': opened,
		'is-loading': isLoading,
	};
	const trackLikeClick = () => props.recordGoogleEvent( 'Stats Post Likes', 'Clicked on Gravatar' );

	return (
		<Card className={ classNames( 'stats-module', 'stats-post-likes', 'is-expanded', classes ) }>
			<QueryPostLikes siteId={ siteId } postId={ postId } />
			<div className="module-header">
				<h4 className="module-header-title">
					{ translate( 'Post Likes' ) }
					{ countLikes !== null && <Count count={ countLikes } /> }
				</h4>
				<ul className="module-header-actions">
					<li className="module-header-action toggle-info">
						<a
							href="#"
							className="module-header-action-link"
							aria-label={ translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) }
							title={ translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) }
							onClick={ toggle }
						>
							<Gridicon icon={ infoIcon } />
						</a>
					</li>
				</ul>
			</div>
			<StatsModuleContent className="module-content-text-info">
				<p>{ translate( 'This panel shows the list of people who likes your post.' ) }</p>
			</StatsModuleContent>
			<StatsModulePlaceholder isLoading={ isLoading } />
			{ likes && !! likes.length &&
				<div className="stats-post-likes__content">
					{ likes
							.map( like =>
								<a
									key={ like.ID }
									href={ `https://gravatar.com/${ like.login }` }
									rel="noopener noreferrer"
									target="_blank"
									className="stats-post-likes__like"
									onClick={ trackLikeClick }
								>
									<Gravatar user={ like } />
								</a>
							).concat(
								countLikes > likes.length && <span key="placeholder" className="stats-post-likes__placeholder">
									{ `+ ${ countLikes - likes.length }` }
								</span>
							)
					}
				</div>
			}
			{ countLikes === 0 && ! isRequesting &&
				<div className="stats-post-likes__content">
					{ translate( 'There are no likes on this post yet.' ) }
				</div>
			}
		</Card>
	);
};

const connectComponent = connect(
	( state, { siteId, postId } ) => {
		const isRequesting = isRequestingPostLikes( state, siteId, postId );
		const countLikes = countPostLikes( state, siteId, postId );
		const likes = getPostLikes( state, siteId, postId );
		return {
			countLikes,
			isRequesting,
			likes,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	toggleInfo,
	localize
)( PostLikes );
