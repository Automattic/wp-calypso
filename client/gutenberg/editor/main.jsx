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
	state = {
		isAPIOverrideReady: false,
	};

	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();
	}

	static getDerivedStateFromProps( props, state ) {
		// Execute API override only once when siteSlug is not null.
		// We can't do this in componentDidMount because it wouldn't work with clean state.
		// siteSlug would be null and API requests would get executed before the override.
		if ( ! isEmpty( props.siteSlug ) && ! state.isAPIOverrideReady ) {
			overrideAPIPaths( props.siteSlug );
			return { isAPIOverrideReady: true };
		}

		return null;
	}

	render() {
		if ( ! this.state.isAPIOverrideReady ) {
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
