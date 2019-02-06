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
import { isEnabled } from 'config';
import PopoverMenuItem from 'components/popover/menu-item';
import { getPost } from 'state/posts/selectors';
import canCurrentUserEditPost from 'state/selectors/can-current-user-edit-post';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import {
	getEditorDuplicatePostPath,
	getCalypsoifyEditorDuplicatePostPath,
} from 'state/ui/editor/selectors';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import { isJetpackSite } from 'state/sites/selectors';

function PostActionsEllipsisMenuDuplicate( {
	canEdit,
	duplicateUrl,
	isUnsupportedJetpack,
	onDuplicateClick,
	status,
	translate,
	type,
} ) {
	const validStatus = includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], status );

	if ( ! canEdit || ! validStatus || 'post' !== type || isUnsupportedJetpack ) {
		return null;
	}

	return (
		<PopoverMenuItem href={ duplicateUrl } onClick={ onDuplicateClick } icon="clipboard">
			{ translate( 'Copy', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuDuplicate.propTypes = {
	canEdit: PropTypes.bool,
	duplicateUrl: PropTypes.string,
	isUnsupportedJetpack: PropTypes.bool,
	onDuplicateClick: PropTypes.func,
	status: PropTypes.string,
	translate: PropTypes.func.isRequired,
	type: PropTypes.string,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const isUnsupportedJetpack =
		! isEnabled( 'calypsoify/iframe' ) ||
		( isJetpackSite( state, post.site_ID ) &&
			! isJetpackModuleActive( state, post.site_ID, 'copy-post' ) );
	const calypsoifyGutenberg =
		isCalypsoifyGutenbergEnabled( state, post.site_ID ) &&
		'gutenberg' === getSelectedEditor( state, post.site_ID );
	const duplicateUrl =
		!! calypsoifyGutenberg && ! isUnsupportedJetpack
			? getCalypsoifyEditorDuplicatePostPath( state, post.site_ID, post.ID )
			: getEditorDuplicatePostPath( state, post.site_ID, post.ID );

	return {
		canEdit: canCurrentUserEditPost( state, globalId ),
		duplicateUrl,
		isUnsupportedJetpack,
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
