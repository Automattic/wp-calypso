/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPostType, getPostTypeLabel } from 'calypso/state/post-types/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import QueryPostTypes from 'calypso/components/data/query-post-types';
import EmptyContent from 'calypso/components/empty-content';
import { preloadEditor } from 'calypso/sections-preloaders';

function PostTypeListEmptyContent( {
	siteId,
	translate,
	status,
	typeObject,
	editPath,
	addNewItemLabel,
} ) {
	let title;
	let action;

	if ( 'draft' === status ) {
		title = translate( "You don't have any drafts." );
	} else if ( typeObject ) {
		title = typeObject.labels.not_found;
	}

	if ( typeObject ) {
		action = addNewItemLabel;
	}

	return (
		<div>
			{ siteId && <QueryPostTypes siteId={ siteId } /> }
			<EmptyContent
				title={ title }
				action={ action }
				actionURL={ editPath }
				actionHoverCallback={ preloadEditor }
				illustration="/calypso/images/pages/illustration-pages.svg"
				illustrationWidth={ 150 }
			/>
		</div>
	);
}

PostTypeListEmptyContent.propTypes = {
	siteId: PropTypes.number,
	translate: PropTypes.func,
	type: PropTypes.string,
	status: PropTypes.string,
	typeObject: PropTypes.object,
	editPath: PropTypes.string,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const localeSlug = getLocaleSlug( state );

	return {
		siteId,
		typeObject: getPostType( state, siteId, ownProps.type ),
		editPath: getEditorUrl( state, siteId, null, ownProps.type ),
		addNewItemLabel: getPostTypeLabel( state, siteId, ownProps.type, 'add_new_item', localeSlug ),
	};
} )( localize( PostTypeListEmptyContent ) );
