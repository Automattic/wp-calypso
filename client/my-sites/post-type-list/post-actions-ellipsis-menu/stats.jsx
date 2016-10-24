/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { mc } from 'lib/analytics';
import { getSiteSlug, isJetpackModuleActive } from 'state/sites/selectors';
import { getPost } from 'state/posts/selectors';

function bumpStat() {
	mc.bumpStat( 'calypso_cpt_actions', 'stats' );
}

function PostActionsEllipsisMenuStats( { translate, siteSlug, postId, status, isStatsActive } ) {
	if ( ! isStatsActive || 'publish' !== status ) {
		return null;
	}

	return (
		<PopoverMenuItem
			href={ `/stats/post/${ postId }/${ siteSlug }` }
			onClick={ bumpStat }
			icon="stats-alt">
			{ translate( 'Stats' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuStats.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	siteSlug: PropTypes.string,
	postId: PropTypes.number,
	status: PropTypes.string,
	isStatsActive: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	return {
		siteSlug: getSiteSlug( state, post.site_ID ),
		postId: post.ID,
		status: post.status,
		isStatsActive: false !== isJetpackModuleActive( state, post.site_ID, 'stats' )
	};
} )( localize( PostActionsEllipsisMenuStats ) );
