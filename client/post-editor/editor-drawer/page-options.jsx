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
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getPostType } from 'state/post-types/selectors';
import PageParent from 'post-editor/editor-page-parent';
import PageTemplatesData from 'components/data/page-templates-data';
import PageTemplates from 'post-editor/editor-page-templates';
import PageOrder from 'post-editor/editor-page-order';
import Accordion from 'components/accordion';
import Gridicon from 'components/gridicon';

function EditorDrawerPageOptions( { translate, siteId, postId, post, postType, hierarchical } ) {
	let title;
	if ( 'page' === postType ) {
		title = translate( 'Page Attributes' );
	} else {
		title = translate( 'Attributes' );
	}

	return (
		<Accordion title={ title } icon={ <Gridicon icon="pages" /> }>
			{ hierarchical && (
				<PageParent
					siteId={ siteId }
					postId={ postId }
					parent={ get( post, 'parent_id', 0 ) } />
			) }
			{ siteId && 'page' === postType && (
				<PageTemplatesData siteId={ siteId } >
					<PageTemplates post={ post } />
				</PageTemplatesData>
			) }
			<PageOrder menuOrder={ get( post, 'menu_order', 0 ) } />
		</Accordion>
	);
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const hierarchical = 'page' === postType || get( getPostType( state, siteId, postType ), 'hierarchical' );

	return { siteId, postId, postType, hierarchical };
} )( localize( EditorDrawerPageOptions ) );
