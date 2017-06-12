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
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import { decodeEntities } from 'lib/formatting';
import PostStatus from 'blocks/post-status';

function EditorPostType( { translate, siteId, typeSlug, type, globalId, isSettings } ) {
	let label;
	if ( 'page' === typeSlug ) {
		if ( isSettings ) {
			label = translate( 'Page Settings' );
		} else {
			label = translate( 'Page', { context: 'noun' } );
		}
	} else if ( 'post' === typeSlug ) {
		if ( isSettings ) {
			label = translate( 'Post Settings' );
		} else {
			label = translate( 'Post', { context: 'noun' } );
		}
	} else if ( type ) {
		if ( isSettings ) {
			label = translate( '%s: Settings', {
				args: type.labels.singular_name,
				comment: "type refers to a post type's singular noun",
			} );
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
			{ label } <PostStatus globalId={ globalId } showAll showIcon={ false } />
		</span>
	);
}

EditorPostType.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number,
	typeSlug: PropTypes.string,
	type: PropTypes.object,
	globalId: PropTypes.string,
	isSettings: PropTypes.bool,
};

export default connect( ( state ) => {
	const props = {};
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
		type: getPostType( state, site.ID, post.type ),
		globalId: post.global_ID
	} );
} )( localize( EditorPostType ) );
