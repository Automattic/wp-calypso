/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import PopoverMenuItem from 'components/popover/menu-item';
import { isEnabled } from 'config';
import { bumpStat } from 'state/analytics/actions';
import { getCurrentUserId, isValidCapability } from 'state/current-user/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getPost } from 'state/posts/selectors';
import { canCurrentUser } from 'state/selectors';
import { getEditorDuplicatePostPath } from 'state/ui/editor/selectors';

const bumpDuplicateStat = () => bumpStat( 'calypso_cpt_actions', 'duplicate' );

function PostActionsEllipsisMenuDuplicate(
	{ translate, siteId, canEdit, duplicateUrl, isKnownType, bumpDuplicateStat: handleStatBump, status }
) {
	const validStatus = includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], status );

	if ( ! isEnabled( 'posts/post-type-list' ) || ! canEdit || ! validStatus ) {
		return null;
	}

	return (
		<PopoverMenuItem href={ duplicateUrl } onClick={ handleStatBump } icon="pages">
			{ siteId && ! isKnownType && <QueryPostTypes siteId={ siteId } /> }
			{ translate( 'Duplicate', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuDuplicate.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number,
	canEdit: PropTypes.bool,
	status: PropTypes.string,
	duplicateUrl: PropTypes.string,
	isKnownType: PropTypes.bool,
	bumpDuplicateStat: PropTypes.func,
};

export default connect( ( state, { globalId } ) => {
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
		status: post.status,
		siteId: post.site_ID,
		canEdit: canCurrentUser( state, post.site_ID, capability ),
		duplicateUrl: getEditorDuplicatePostPath( state, post.site_ID, post.ID ),
		isKnownType: !! type
	};
}, { bumpDuplicateStat } )( localize( PostActionsEllipsisMenuDuplicate ) );
