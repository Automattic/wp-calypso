/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, noop } from 'lodash';
import '@wordpress/core-data';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { overrideAPIPaths, registerCoreBlocks } from './utils';

const editorSettings = {};
const overridePost = {};
const post = {
	type: 'post',
	content: {},
};

class GutenbergEditor extends Component {
	componentDidMount() {
		registerCoreBlocks();
	}

	render() {
		if ( isEmpty( this.props.siteSlug ) ) {
			return null;
		}

		overrideAPIPaths( this.props.siteSlug );

		return (
			<Editor
				settings={ editorSettings }
				hasFixedToolbar={ true }
				post={ post }
				overridePost={ overridePost }
				onError={ noop }
			/>
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
