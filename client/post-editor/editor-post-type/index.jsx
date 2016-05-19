/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditedPost } from 'state/posts/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getEditorPostId, isEditorNewPost } from 'state/ui/editor/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import { decodeEntities } from 'lib/formatting';

function EditorPostType( { translate, siteId, isNew, typeSlug, type } ) {
	let label;
	if ( 'page' === typeSlug ) {
		if ( isNew ) {
			label = translate( 'New Page' );
		} else {
			label = translate( 'Page', { context: 'noun' } );
		}
	} else if ( 'post' === typeSlug ) {
		if ( isNew ) {
			label = translate( 'New Post' );
		} else {
			label = translate( 'Post', { context: 'noun' } );
		}
	} else if ( type ) {
		if ( isNew ) {
			label = type.labels.new_item;
		} else {
			label = type.labels.singular_name;
		}

		label = decodeEntities( label );
	} else {
		label = translate( 'Loading…' );
	}

	const classes = classnames( 'editor-post-type', {
		'is-loading': ! label
	} );

	return (
		<span className={ classes }>
			{ siteId && 'page' !== typeSlug && 'post' !== typeSlug && (
				<QueryPostTypes siteId={ siteId } />
			) }
			{ label }
		</span>
	);
}

EditorPostType.propTypes = {
	translate: PropTypes.func,
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
} )( localize( EditorPostType ) );
