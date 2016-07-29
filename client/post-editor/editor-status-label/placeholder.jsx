/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditedPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { decodeEntities } from 'lib/formatting';
import QueryPostTypes from 'components/data/query-post-types';

function EditorStatusLabelPlaceholder( { translate, siteId, typeSlug, type, className } ) {
	const classes = classnames( 'editor-status-label__placeholder', className );

	let label;
	if ( 'post' === typeSlug ) {
		label = translate( 'Loading Post…' );
	} else if ( 'page' === typeSlug ) {
		label = translate( 'Loading Page…' );
	} else if ( type ) {
		label = translate( 'Loading %(postType)s…', {
			args: {
				postType: decodeEntities( type.labels.singular_name )
			}
		} );
	} else {
		label = translate( 'Loading…' );
	}

	return (
		<button className={ classes }>
			{ 'post' !== typeSlug && 'page' !== typeSlug && siteId && (
				<QueryPostTypes siteId={ siteId } />
			) }
			<strong>{ label }</strong>
		</button>
	);
}

EditorStatusLabelPlaceholder.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number,
	typeSlug: PropTypes.string,
	type: PropTypes.object,
	className: PropTypes.string
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
} )( localize( EditorStatusLabelPlaceholder ) );
