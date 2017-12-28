/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditedPostValue } from 'client/state/posts/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getPostType } from 'client/state/post-types/selectors';
import PageParent from 'client/post-editor/editor-page-parent';
import PageTemplates from 'client/post-editor/editor-page-templates';
import PageOrder from 'client/post-editor/editor-page-order';
import Accordion from 'client/components/accordion';

function EditorDrawerPageOptions( { translate, postType, hierarchical } ) {
	let title;
	if ( 'page' === postType ) {
		title = translate( 'Page Attributes' );
	} else {
		title = translate( 'Attributes' );
	}

	return (
		<Accordion title={ title } e2eTitle="page-options">
			{ hierarchical && <PageParent /> }
			<PageTemplates />
			<PageOrder />
		</Accordion>
	);
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const hierarchical =
		'page' === postType || get( getPostType( state, siteId, postType ), 'hierarchical' );

	return { postType, hierarchical };
} )( localize( EditorDrawerPageOptions ) );
