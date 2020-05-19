/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { Button, Dialog } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

function EditorForbidden( { translate, userCanEdit, siteSlug } ) {
	if ( false !== userCanEdit ) {
		return null;
	}

	const buttons = [
		<Button key="back" href={ `/posts/${ siteSlug }` } primary>
			{ translate( 'Back to My Sites' ) }
		</Button>,
	];

	return (
		<Dialog isVisible buttons={ buttons } className="editor-forbidden">
			<h1>{ translate( "You can't edit this post type" ) }</h1>
			<p>
				{ translate(
					'If you think you should have access to this post type, request that your site administrator grant you access.'
				) }
			</p>
		</Dialog>
	);
}

EditorForbidden.propTypes = {
	translate: PropTypes.func,
	userCanEdit: PropTypes.bool,
	siteSlug: PropTypes.string,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const type = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );
	const typeObject = getPostType( state, siteId, type );
	const capability = get( typeObject, [ 'capabilities', 'edit_posts' ], null );

	return {
		userCanEdit: canCurrentUser( state, siteId, capability ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( EditorForbidden ) );
