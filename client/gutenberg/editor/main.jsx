/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, noop } from 'lodash';
import { dispatch } from '@wordpress/data';
import '@wordpress/core-data'; // Initializes core data store
import { registerCoreBlocks } from '@wordpress/block-library';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { applyAPIMiddlewares } from './utils';

const editorSettings = {};

const post = {
	type: 'post',
	content: 'test content',
};

class GutenbergEditor extends Component {
	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();
	}

	render() {
		if ( isEmpty( this.props.siteSlug ) ) {
			return null;
		}

		applyAPIMiddlewares( this.props.siteSlug );

		return (
			<Editor settings={ editorSettings } hasFixedToolbar={ true } post={ post } onError={ noop } />
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
