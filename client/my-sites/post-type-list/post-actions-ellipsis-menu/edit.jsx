/** @format */

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
import { isEnabled } from 'config';
import PopoverMenuItem from 'components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getPost } from 'state/posts/selectors';
import canCurrentUserEditPost from 'state/selectors/can-current-user-edit-post';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { getSiteAdminUrl } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { preload } from 'sections-helper';

function preloadEditor() {
	preload( 'post-editor' );
}

function PostActionsEllipsisMenuEdit( { translate, canEdit, status, editUrl, bumpStat } ) {
	if ( 'trash' === status || ! canEdit ) {
		return null;
	}

	return (
		<PopoverMenuItem
			href={ editUrl }
			onClick={ bumpStat }
			icon="pencil"
			onMouseOver={ preloadEditor }
		>
			{ translate( 'Edit', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuEdit.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	canEdit: PropTypes.bool,
	status: PropTypes.string,
	editUrl: PropTypes.string,
	bumpStat: PropTypes.func,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const siteAdminUrl = getSiteAdminUrl( state, post.site_ID );
	const editUrl =
		isEnabled( 'calypsoify/gutenberg' ) && 'gutenberg' === getSelectedEditor( state, post.site_ID )
			? `${ siteAdminUrl }post.php?post=${ post.ID }&action=edit&calypsoify=1`
			: getEditorPath( state, post.site_ID, post.ID );

	return {
		canEdit: canCurrentUserEditPost( state, globalId ),
		status: post.status,
		type: post.type,
		editUrl,
	};
};

const mapDispatchToProps = { bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator( stateProps.type, 'edit', dispatchProps.bumpAnalyticsStat );
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuEdit ) );
