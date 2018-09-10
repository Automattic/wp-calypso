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
import wpcomProxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { applyAPIMiddlewares } from './utils';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

const editorSettings = {};

class GutenbergEditor extends Component {
	state = { newPostId: null };

	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();

		// Create a new dummy post if we are not opening an existing one
		if ( ! this.props.postId && this.props.siteSlug ) {
			this.createDummyPost( this.props.siteSlug );
		}
	}

	componentDidUpdate() {
		// Handle the case of empty siteSlug on clean cache mount
		if ( ! this.state.newPostId && ! this.props.postId && this.props.siteSlug ) {
			this.createDummyPost( this.props.siteSlug );
		}
	}

	createDummyPost = siteSlug => {
		wpcomProxyRequest(
			{
				path: `/sites/${ siteSlug }/posts/`,
				apiNamespace: 'wp/v2',
				method: 'POST',
				body: { content: 'Welcome to the Gutenberg Editor!' },
			},
			( error, body ) => {
				if ( error ) {
					debug( 'Failed creating dummy post: ' + error );
				}

				debug( 'New post ID: ' + body.id );
				this.setState( { newPostId: body.id } );
			}
		);
	};

	render() {
		if ( isEmpty( this.props.siteSlug ) ) {
			return null;
		}

		applyAPIMiddlewares( this.props.siteSlug );

		const postId = this.props.postId || this.state.newPostId;
		const postType = this.props.postType || 'post';

		return (
			<Editor
				settings={ editorSettings }
				hasFixedToolbar={ true }
				onError={ noop }
				postId={ postId }
				postType={ postType }
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
