/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getSiteSlug, isJetpackModuleActive } from 'calypso/state/sites/selectors';
import { getPost } from 'calypso/state/posts/selectors';

function PostActionsEllipsisMenuStats( {
	translate,
	siteSlug,
	postId,
	status,
	isStatsActive,
	bumpStat,
} ) {
	if ( ! isStatsActive || 'publish' !== status ) {
		return null;
	}

	return (
		<PopoverMenuItem
			href={ `/stats/post/${ postId }/${ siteSlug }` }
			onClick={ bumpStat }
			icon="stats-alt"
		>
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
	isStatsActive: PropTypes.bool,
	bumpStat: PropTypes.func,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		siteSlug: getSiteSlug( state, post.site_ID ),
		postId: post.ID,
		status: post.status,
		type: post.type,
		isStatsActive: false !== isJetpackModuleActive( state, post.site_ID, 'stats' ),
	};
};

const mapDispatchToProps = { bumpAnalyticsStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type,
		'stats',
		dispatchProps.bumpAnalyticsStat,
		dispatchProps.recordTracksEvent
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuStats ) );
