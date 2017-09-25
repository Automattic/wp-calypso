/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StatsModuleContent from '../stats-module/content-text';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';
import PostLikes from 'blocks/post-likes';
import Card from 'components/card';
import Count from 'components/count';
import QueryPostLikes from 'components/data/query-post-likes';
import { isRequestingPostLikes, countPostLikes } from 'state/selectors';

export const StatsPostLikes = props => {
	const { countLikes, isRequesting, opened, postId, postType, siteId, toggle, translate } = props;
	const infoIcon = opened ? 'info' : 'info-outline';
	const isLoading = isRequesting && ! countLikes;
	const classes = {
		'is-showing-info': opened,
		'is-loading': isLoading,
	};

	let likesListLabel, likesTitleLabel;

	if ( postType === 'page' ) {
		likesTitleLabel = translate( 'Page Likes' );
		likesListLabel = translate( 'This panel shows the list of people who like your page.' );
	} else {
		likesTitleLabel = translate( 'Post Likes' );
		likesListLabel = translate( 'This panel shows the list of people who like your post.' );
	}

	return (
		<Card className={ classNames( 'stats-module', 'stats-post-likes', 'is-expanded', classes ) }>
			<QueryPostLikes siteId={ siteId } postId={ postId } />
			<div className="module-header">
				<h4 className="module-header-title">
					{ likesTitleLabel }
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
				{ likesListLabel }
			</StatsModuleContent>
			<StatsModulePlaceholder isLoading={ isLoading } />
			<div className="stats-post-likes__content">
				<PostLikes siteId={ siteId } postId={ postId } postType={ postType } />
			</div>
		</Card>
	);
};

StatsPostLikes.defaultProps = {
	postType: 'post'
};

const connectComponent = connect(
	( state, { siteId, postId } ) => {
		const isRequesting = isRequestingPostLikes( state, siteId, postId );
		const countLikes = countPostLikes( state, siteId, postId );
		return {
			countLikes,
			isRequesting,
		};
	}
);

export default flowRight(
	connectComponent,
	toggleInfo,
	localize
)( StatsPostLikes );
