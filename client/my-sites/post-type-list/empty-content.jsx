/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPostType } from 'state/post-types/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import EmptyContent from 'components/empty-content/empty-content';

function PostTypeListEmptyContent( { siteId, translate, status, typeObject, editPath } ) {
	let title, action;

	if ( 'draft' === status ) {
		title = translate( 'You don\'t have any drafts.' );
	} else if ( typeObject ) {
		title = typeObject.labels.not_found;
	}

	if ( typeObject ) {
		action = typeObject.labels.add_new_item;
	}

	return (
		<div>
			{ siteId && (
				<QueryPostTypes siteId={ siteId } />
			) }
			<EmptyContent
				title={ title }
				action={ action }
				actionURL={ editPath }
				illustration="/calypso/images/pages/illustration-pages.svg"
				illustrationWidth={ 150 } />
		</div>
	);
}

PostTypeListEmptyContent.propTypes = {
	siteId: PropTypes.number,
	translate: PropTypes.func,
	type: PropTypes.string,
	status: PropTypes.string,
	typeObject: PropTypes.object,
	editPath: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		typeObject: getPostType( state, siteId, ownProps.type ),
		editPath: getEditorPath( state, siteId, null, ownProps.type )
	};
} )( localize( PostTypeListEmptyContent ) );
