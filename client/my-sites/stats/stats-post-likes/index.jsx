import { Card } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { compose } from 'redux';
import PostLikes from 'calypso/blocks/post-likes';
import { usePostLikes } from 'calypso/components/data/post-likes';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';

import './style.scss';

export const StatsPostLikes = ( props ) => {
	const { postId, postType, siteId } = props;
	const { countLikes } = usePostLikes( siteId, postId );
	// Prevent loading for postId `0`
	const isLoading = !! postId && countLikes === null;
	const classes = {
		'is-loading': isLoading,
	};

	return (
		<Card className={ clsx( 'stats-module', 'stats-post-likes', classes ) }>
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

export default compose( toggleInfo, localize )( StatsPostLikes );
