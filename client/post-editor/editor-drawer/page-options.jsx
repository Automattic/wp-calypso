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
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getEditedPostValue } from 'calypso/state/posts/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getPostType } from 'calypso/state/post-types/selectors';
import PageParent from 'calypso/post-editor/editor-page-parent';
import PageTemplates from 'calypso/post-editor/editor-page-templates';
import PageOrder from 'calypso/post-editor/editor-page-order';
import Accordion from 'calypso/components/accordion';

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

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const hierarchical =
		'page' === postType || get( getPostType( state, siteId, postType ), 'hierarchical' );

	return { postType, hierarchical };
} )( localize( EditorDrawerPageOptions ) );
