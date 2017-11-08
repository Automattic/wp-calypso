/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { canCurrentUser } from 'state/selectors';
import { getPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getCurrentUserId, isValidCapability } from 'state/current-user/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

function PostActionsEllipsisMenuEdit( { translate, canEdit, status, editUrl, bumpStat } ) {
	if ( 'trash' === status || ! canEdit ) {
		return null;
	}

	return (
		<PopoverMenuItem href={ editUrl } onClick={ bumpStat } icon="pencil">
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

	const type = getPostType( state, post.site_ID, post.type );
	const userId = getCurrentUserId( state );
	const isAuthor = get( post.author, 'ID' ) === userId;

	let capability = isAuthor ? 'edit_posts' : 'edit_others_posts';
	const typeCapability = get( type, [ 'capabilities', capability ] );
	if ( isValidCapability( state, post.site_ID, typeCapability ) ) {
		capability = typeCapability;
	}

	return {
		canEdit: canCurrentUser( state, post.site_ID, capability ),
		status: post.status,
		editUrl: getEditorPath( state, post.site_ID, post.ID ),
	};
};

const mapDispatchToProps = { bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		get( stateProps, 'type.name' ),
		'edit',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuEdit )
);
