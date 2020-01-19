/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { getPost } from 'state/posts/selectors';
import canCurrentUserEditPost from 'state/selectors/can-current-user-edit-post';
import { getEditorDuplicatePostPath } from 'state/ui/editor/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';

function PostActionsEllipsisMenuDuplicate( {
	translate,
	canEdit,
	status,
	type,
	copyPostIsActive,
	duplicateUrl,
	onDuplicateClick,
	siteId,
} ) {
	const validStatus = includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], status );

	if ( ! canEdit || ! validStatus || 'post' !== type || ! copyPostIsActive ) {
		return <QueryJetpackModules siteId={ siteId } />;
	}

	return (
		<PopoverMenuItem href={ duplicateUrl } onClick={ onDuplicateClick } icon="clipboard">
			<QueryJetpackModules siteId={ siteId } />
			{ translate( 'Copy Post' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuDuplicate.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	canEdit: PropTypes.bool,
	status: PropTypes.string,
	type: PropTypes.string,
	copyPostIsActive: PropTypes.bool,
	duplicateUrl: PropTypes.string,
	onDuplicateClick: PropTypes.func,
	siteId: PropTypes.number,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		canEdit: canCurrentUserEditPost( state, globalId ),
		status: post.status,
		type: post.type,
		copyPostIsActive:
			false === isJetpackSite( state, post.site_ID ) ||
			isJetpackModuleActive( state, post.site_ID, 'copy-post' ),
		duplicateUrl: getEditorDuplicatePostPath( state, post.site_ID, post.ID ),
		siteId: post.site_ID,
	};
};

const mapDispatchToProps = { bumpStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpDuplicateStat = bumpStatGenerator(
		stateProps.type,
		'duplicate',
		dispatchProps.bumpStat
	);
	const onDuplicateClick = () => {
		bumpDuplicateStat();
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_duplicate', {
			post_type: stateProps.type,
		} );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { onDuplicateClick } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuDuplicate ) );
