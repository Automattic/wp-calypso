/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { canCurrentUser } from 'state/current-user/selectors';
import Button from 'components/button';
import Dialog from 'components/dialog';

function EditorForbidden( { translate, userCanEdit, siteSlug } ) {
	if ( false !== userCanEdit ) {
		return null;
	}

	const buttons = [
		<Button key="back" href={ `/posts/${ siteSlug }` } primary>
			{ translate( 'Back to My Sites' ) }
		</Button>
	];

	return (
		<Dialog
			isVisible
			buttons={ buttons }
			className="editor-forbidden">
			<h1>{ translate( 'You can\'t edit this post type' ) }</h1>
			<p>{ translate( 'If you think you should have access to this post type, request that your site administrator grant you access.' ) }</p>
		</Dialog>
	);
}

EditorForbidden.propTypes = {
	translate: PropTypes.func,
	userCanEdit: PropTypes.bool,
	siteSlug: PropTypes.string
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const type = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );
	const typeObject = getPostType( state, siteId, type );
	const capability = get( typeObject, [ 'capabilities', 'edit_posts' ], null );

	return {
		userCanEdit: canCurrentUser( state, siteId, capability ),
		siteSlug: getSiteSlug( state, siteId )
	};
} )( localize( EditorForbidden ) );
