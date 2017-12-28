/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditedPost } from 'client/state/posts/selectors';
import { getPostType } from 'client/state/post-types/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { decodeEntities } from 'client/lib/formatting';
import QueryPostTypes from 'client/components/data/query-post-types';

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
				postType: decodeEntities( type.labels.singular_name ),
			},
		} );
	} else {
		label = translate( 'Loading…' );
	}

	return (
		<button className={ classes }>
			{ 'post' !== typeSlug &&
				'page' !== typeSlug &&
				siteId && <QueryPostTypes siteId={ siteId } /> }
			<strong>{ label }</strong>
		</button>
	);
}

EditorStatusLabelPlaceholder.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number,
	typeSlug: PropTypes.string,
	type: PropTypes.object,
	className: PropTypes.string,
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const props = { siteId };

	const post = getEditedPost( state, siteId, getEditorPostId( state ) );
	if ( ! post ) {
		return props;
	}

	return Object.assign( props, {
		typeSlug: post.type,
		type: getPostType( state, siteId, post.type ),
	} );
} )( localize( EditorStatusLabelPlaceholder ) );
