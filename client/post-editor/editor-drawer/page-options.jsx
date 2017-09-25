/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import PageOrder from 'post-editor/editor-page-order';
import PageParent from 'post-editor/editor-page-parent';
import PageTemplates from 'post-editor/editor-page-templates';
import { getPostType } from 'state/post-types/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

function EditorDrawerPageOptions( { translate, postType, hierarchical } ) {
	let title;
	if ( 'page' === postType ) {
		title = translate( 'Page Attributes' );
	} else {
		title = translate( 'Attributes' );
	}

	return (
		<Accordion title={ title }>
			{ hierarchical && (
				<PageParent />
			) }
			<PageTemplates />
			<PageOrder />
		</Accordion>
	);
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const hierarchical = 'page' === postType || get( getPostType( state, siteId, postType ), 'hierarchical' );

	return { postType, hierarchical };
} )( localize( EditorDrawerPageOptions ) );
