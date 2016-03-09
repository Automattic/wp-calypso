/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { translate } from 'lib/mixins/i18n';
import { getEditedPost } from 'state/posts/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getEditorPostId, isEditorNewPost } from 'state/ui/editor/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';

function EditorPostType( { siteId, isNew, typeSlug, type } ) {
	let label;
	switch ( typeSlug ) {
		case 'page':
			if ( isNew ) {
				label = translate( 'New Page' );
			} else {
				label = translate( 'Page', { context: 'noun' } );
			}
			break;
		case 'post':
			if ( isNew ) {
				label = translate( 'New Post' );
			} else {
				label = translate( 'Post', { context: 'noun' } );
			}
			break;
		default:
			if ( isNew ) {
				label = get( type, 'labels.new_item' );
			} else {
				label = get( type, 'labels.singular_name' );
			}
			break;
	}

	const classes = classnames( 'editor-post-type', {
		'is-loading': ! label
	} );

	return (
		<span className={ classes }>
			{ siteId && 'page' !== typeSlug && 'post' !== typeSlug && (
				<QueryPostTypes siteId={ siteId } />
			) }
			{ label || translate( 'Loading…' ) }
		</span>
	);
}

EditorPostType.propTypes = {
	siteId: PropTypes.number,
	isNew: PropTypes.bool,
	typeSlug: PropTypes.string,
	type: PropTypes.object
};

export default connect( ( state ) => {
	const props = { isNew: isEditorNewPost( state ) };
	const site = getSelectedSite( state );
	if ( ! site ) {
		return props;
	}

	props.siteId = site.ID;
	const post = getEditedPost( state, site.ID, getEditorPostId( state ) );
	if ( ! post ) {
		return props;
	}

	return Object.assign( props, {
		typeSlug: post.type,
		type: getPostType( state, site.ID, post.type )
	} );
} )( EditorPostType );
