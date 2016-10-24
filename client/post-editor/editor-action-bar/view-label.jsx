/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { getEditedPost } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';

function EditorActionBarViewLabel( { translate, siteId, typeSlug, type } ) {
	let label;
	if ( 'page' === typeSlug ) {
		label = translate( 'View page' );
	} else if ( 'post' === typeSlug ) {
		label = translate( 'View post' );
	} else if ( type ) {
		label = decodeEntities( type.labels.view_item );
	} else {
		label = translate( 'View', { context: 'verb' } );
	}

	return (
		<span className="editor-action-bar__view-label">
			{ siteId && 'page' !== typeSlug && 'post' !== typeSlug && (
				<QueryPostTypes siteId={ siteId } />
			) }
			{ label }
		</span>
	);
}

EditorActionBarViewLabel.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number,
	typeSlug: PropTypes.string,
	type: PropTypes.object
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const props = { siteId };
	const post = getEditedPost( state, siteId, getEditorPostId( state ) );
	if ( ! post ) {
		return props;
	}

	return Object.assign( props, {
		typeSlug: post.type,
		type: getPostType( state, siteId, post.type )
	} );
} )( localize( EditorActionBarViewLabel ) );
