/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { dispatch } from '@wordpress/data';
import '@wordpress/core-data'; // Initializes core data store
import { registerCoreBlocks } from '@wordpress/block-library';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import QueryPostTypes from 'components/data/query-post-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { WithAPIMiddleware } from './api-middleware/utils';

const editorSettings = {};

const mockPost = {
	type: 'post',
	content: { raw: 'test content' },
};

class GutenbergEditor extends Component {
	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();
	}

	render() {
		const { postType, siteId, siteSlug } = this.props;
		const post = { ...mockPost, type: postType };

		return (
			<WithAPIMiddleware siteSlug={ siteSlug }>
				<QueryPostTypes siteId={ siteId } />
				<EditorPostTypeUnsupported type={ postType } />
				<Editor
					settings={ editorSettings }
					hasFixedToolbar={ true }
					post={ post }
					onError={ noop }
				/>
			</WithAPIMiddleware>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
