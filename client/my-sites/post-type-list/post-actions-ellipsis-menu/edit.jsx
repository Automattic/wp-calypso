/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import QueryPostTypes from 'components/data/query-post-types';
import { mc } from 'lib/analytics';
import { canCurrentUser } from 'state/selectors';
import { getPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getCurrentUserId, isValidCapability } from 'state/current-user/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

function PostActionsEllipsisMenuEdit( { translate, siteId, canEdit, status, editUrl, isKnownType } ) {
	if ( 'trash' === status || ! canEdit ) {
		return null;
	}

	function bumpStat() {
		mc.bumpStat( 'calypso_cpt_actions', 'edit' );
	}

	return (
		<PopoverMenuItem href={ editUrl } onClick={ bumpStat } icon="pencil">
			{ siteId && ! isKnownType && <QueryPostTypes siteId={ siteId } /> }
			{ translate( 'Edit', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuEdit.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number,
	canEdit: PropTypes.bool,
	status: PropTypes.string,
	editUrl: PropTypes.string,
	isKnownType: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
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
		siteId: post.site_ID,
		canEdit: canCurrentUser( state, post.site_ID, capability ),
		status: post.status,
		editUrl: getEditorPath( state, post.site_ID, post.ID ),
		isKnownType: !! type
	};
} )( localize( PostActionsEllipsisMenuEdit ) );
