/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getNormalizedPost } from 'calypso/state/posts/selectors';
import { getSiteSlug, isJetpackModuleActive } from 'calypso/state/sites/selectors';

class PostActionsEllipsisMenuComments extends PureComponent {
	static propTypes = {
		globalId: PropTypes.string,
	};

	render() {
		const { bumpStat, isModuleActive, postId, siteSlug, status, translate } = this.props;

		if ( ! isModuleActive || 'publish' !== status ) {
			return null;
		}

		return (
			<PopoverMenuItem
				href={ `/comments/all/${ siteSlug }/${ postId }` }
				icon="chat"
				onClick={ bumpStat }
			>
				{ translate( 'Comments', { context: 'noun' } ) }
			</PopoverMenuItem>
		);
	}
}

const mapStateToProps = ( state, { globalId } ) => {
	const post = getNormalizedPost( state, globalId );
	const postId = post && post.ID;
	const siteId = post && post.site_ID;

	return {
		isModuleActive: false !== isJetpackModuleActive( state, post.site_ID, 'comments' ),
		postId,
		siteSlug: getSiteSlug( state, siteId ),
		status: post.status,
		type: post.type,
	};
};

const mapDispatchToProps = { bumpAnalyticsStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type,
		'comments',
		dispatchProps.bumpAnalyticsStat,
		dispatchProps.recordTracksEvent
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuComments ) );
