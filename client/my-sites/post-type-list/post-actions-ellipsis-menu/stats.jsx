/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getSiteSlug, isJetpackModuleActive } from 'state/sites/selectors';
import { getPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';

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
		isStatsActive: false !== isJetpackModuleActive( state, post.site_ID, 'stats' ),
		type: getPostType( state, post.site_ID, post.type ),
	};
};

const mapDispatchToProps = { bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type.name,
		'stats',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuStats )
);
