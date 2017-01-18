/**
 * External dependencies
 **/
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Count from 'components/count';
import StatsModuleContent from '../stats-module/content-text';
import QueryPostLikes from 'components/data/query-post-likes';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';
import { isRequestingPostLikes, countPostLikes } from 'state/selectors';
import PostLikes from 'blocks/post-likes';

export const StatsPostLikes = props => {
	const { countLikes, isRequesting, opened, postId, siteId, toggle, translate } = props;
	const infoIcon = opened ? 'info' : 'info-outline';
	const isLoading = isRequesting && ! countLikes;
	const classes = {
		'is-showing-info': opened,
		'is-loading': isLoading,
	};

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
				{ translate( 'This panel shows the list of people who like your post.' ) }
			</StatsModuleContent>
			<StatsModulePlaceholder isLoading={ isLoading } />
			<div className="stats-post-likes__content">
				<PostLikes siteId={ siteId } postId={ postId } />
			</div>
		</Card>
	);
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
