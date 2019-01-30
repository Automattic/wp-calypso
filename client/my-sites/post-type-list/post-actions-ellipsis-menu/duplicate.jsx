/** @format */

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
import {
	getEditorDuplicatePostPath,
	getCalypsoifyEditorDuplicatePostPath,
} from 'state/ui/editor/selectors';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';

function PostActionsEllipsisMenuDuplicate( {
	translate,
	canEdit,
	status,
	type,
	duplicateUrl,
	onDuplicateClick,
} ) {
	const validStatus = includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], status );

	if ( ! canEdit || ! validStatus || 'post' !== type ) {
		return null;
	}

	return (
		<PopoverMenuItem href={ duplicateUrl } onClick={ onDuplicateClick } icon="clipboard">
			{ translate( 'Copy', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuDuplicate.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	canEdit: PropTypes.bool,
	status: PropTypes.string,
	type: PropTypes.string,
	duplicateUrl: PropTypes.string,
	onDuplicateClick: PropTypes.func,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const calypsoifyGutenberg =
		isCalypsoifyGutenbergEnabled( state, post.site_ID ) &&
		'gutenberg' === getSelectedEditor( state, post.site_ID );
	const duplicateUrl = !! calypsoifyGutenberg
		? getCalypsoifyEditorDuplicatePostPath( state, post.site_ID, post.ID )
		: getEditorDuplicatePostPath( state, post.site_ID, post.ID );

	return {
		canEdit: canCurrentUserEditPost( state, globalId ),
		duplicateUrl,
		status: post.status,
		type: post.type,
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
