import { Card } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import PostLikes from 'calypso/blocks/post-likes';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import { countPostLikes } from 'calypso/state/posts/selectors/count-post-likes';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';

import './style.scss';

export const StatsPostLikes = ( props ) => {
	const { countLikes, postId, postType, siteId } = props;
	// Prevent loading for postId `0`
	const isLoading = !! postId && countLikes === null;
	const classes = {
		'is-loading': isLoading,
	};

	return (
		<Card className={ clsx( 'stats-module', 'stats-post-likes', classes ) }>
			<QueryPostLikes siteId={ siteId } postId={ postId } />
			<StatsModulePlaceholder isLoading={ isLoading } />
			<div className="stats-post-likes__content">
				<PostLikes siteId={ siteId } postId={ postId } postType={ postType } />
			</div>
		</Card>
	);
};

StatsPostLikes.defaultProps = {
	postType: 'post',
};

const connectComponent = connect( ( state, { siteId, postId } ) => {
	const countLikes = countPostLikes( state, siteId, postId );
	return {
		countLikes,
	};
} );

export default flowRight( connectComponent, toggleInfo, localize )( StatsPostLikes );
