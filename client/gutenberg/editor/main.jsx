/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get, keyBy, mapValues, noop, set } from 'lodash';
import { setSettings as setDateSettings, __experimentalGetSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import EditorDocumentHead from './editor-document-head';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryPostTypes from 'components/data/query-post-types';
import QueryPageTemplates from 'components/data/query-page-templates';
import {
	createAutoDraft,
	requestSitePost,
	requestGutenbergDemoContent,
	requestActiveThemeSupport,
} from 'state/data-getters';
import { getHttpData } from 'state/data-layer/http-data';
import { translate } from 'i18n-calypso';
import './hooks'; // Needed for integrating Calypso's media library (and other hooks)
import isRtlSelector from 'state/selectors/is-rtl';
import refreshRegistrations from '@automattic/jetpack-blocks/src/utils/refresh-registrations';
import { getSiteOption, getSiteSlug } from 'state/sites/selectors';
import { getPageTemplates } from 'state/page-templates/selectors';
import { MimeTypes } from 'lib/media/constants';
import autoUpdateMedia from './utils/media-updater';
import ConvertToBlocksDialog from './components/convert-to-blocks';

/**
 * Style dependencies
 */
import './style.scss';

const setDateGMTOffset = offset =>
	setDateSettings( set( __experimentalGetSettings(), [ 'timezone', 'offset' ], offset ) );

class GutenbergEditor extends Component {
	componentDidMount() {
		const { siteId, postId, uniqueDraftKey, postType, gmtOffset } = this.props;
		if ( ! postId ) {
			createAutoDraft( siteId, uniqueDraftKey, postType );
		}
		if ( siteId && postId && postType ) {
			requestSitePost( siteId, postId, postType, 0 );
		}

		refreshRegistrations();

		setDateGMTOffset( gmtOffset );

		autoUpdateMedia( siteId );
	}

	componentDidUpdate( prevProp ) {
		const { siteId, postId, postType, draftPostId } = this.props;
		if (
			prevProp.siteId !== siteId ||
			prevProp.postId !== postId ||
			prevProp.postType !== postType ||
			prevProp.draftPostId !== draftPostId
		) {
			requestSitePost( siteId, postId || draftPostId, postType, 0 );
		}
	}

	getAnalyticsPathAndTitle = () => {
		const { postId, postType } = this.props;
		const isPost = 'post' === postType;
		const isPage = 'page' === postType;
		const isNew = ! postId;
		const isEdit = !! postId;
		if ( isPost && isNew ) {
			return { path: '/block-editor/post/:site', title: 'Post > New' };
		}
		if ( isPost && isEdit ) {
			return { path: '/block-editor/post/:site/:post_id', title: 'Post > Edit' };
		}
		if ( isPage && isNew ) {
			return { path: '/block-editor/page/:site', title: 'Page > New' };
		}
		if ( isPage && isEdit ) {
			return { path: '/block-editor/page/:site/:post_id', title: 'Page > Edit' };
		}
		if ( isNew ) {
			return { path: `/block-editor/edit/${ postType }/:site`, title: 'Custom Post Type > New' };
		}
		if ( isEdit ) {
			return {
				path: `/block-editor/edit/${ postType }/:site/:post_id`,
				title: 'Custom Post Type > Edit',
			};
		}
	};

	getAllowedMimeTypes = () => {
		const { allowedFileTypes } = this.props;
		const allowedMimeTypes = {};
		allowedFileTypes.forEach( fileType => {
			const mimeType = get( MimeTypes, fileType );
			if ( mimeType ) {
				allowedMimeTypes[ fileType ] = mimeType;
			}
		} );
		return allowedMimeTypes;
	};

	render() {
		const { alignWide, postType, siteId, pageTemplates, post, initialEdits, isRTL } = this.props;

		//see also https://github.com/WordPress/gutenberg/blob/45bc8e4991d408bca8e87cba868e0872f742230b/lib/client-assets.php#L1451
		const editorSettings = {
			alignWide,
			availableTemplates: pageTemplates,
			autosaveInterval: 10, //interval to debounce autosaving events, in seconds.
			titlePlaceholder: translate( 'Add title' ),
			bodyPlaceholder: translate( 'Write your story' ),
			postLock: {},
			isRTL,
			allowedMimeTypes: this.getAllowedMimeTypes(),
		};

		return (
			<Fragment>
				<QueryPostTypes siteId={ siteId } />
				<QueryPageTemplates siteId={ siteId } />
				<PageViewTracker { ...this.getAnalyticsPathAndTitle() } />
				<EditorPostTypeUnsupported type={ postType } />
				<EditorDocumentHead postType={ postType } />
				<ConvertToBlocksDialog />
				<Editor
					settings={ editorSettings }
					hasFixedToolbar={ true }
					post={ post }
					onError={ noop }
					initialEdits={ initialEdits }
				/>
			</Fragment>
		);
	}
}

const getPost = ( siteId, postId, postType ) => {
	if ( siteId && postId && postType ) {
		const requestSitePostData = requestSitePost( siteId, postId, postType );
		return get( requestSitePostData, 'data', null );
	}

	return null;
};

const getInitialEdits = ( {
	isAutoDraft,
	postCopy,
	isDemoContent,
	demoContent,
	duplicatePostId,
} ) => {
	// has saved content
	if ( ! isAutoDraft ) {
		return null;
	}

	// demo content is loading:
	if ( isDemoContent && ! demoContent ) {
		return null;
	}

	// copy content is loading:
	if ( duplicatePostId && ! postCopy ) {
		return null;
	}

	// Duplicate a Post ?jetpack-copy=
	if ( postCopy ) {
		return {
			title: postCopy.title.raw,
			content: postCopy.content.raw,
			excerpt: postCopy.excerpt.raw,
			featured_media: postCopy.featured_media,
			type: postCopy.type,
			format: postCopy.format,
			categories: postCopy.categories,
			tags: postCopy.tags,
		};
	}

	//Demo Content ?gutenberg-demo
	if ( demoContent ) {
		return {
			title: demoContent.title.raw,
			content: demoContent.content.raw,
		};
	}

	// A new draft
	return { title: '' };
};

const mapStateToProps = (
	state,
	{ siteId, postId, uniqueDraftKey, postType, isDemoContent, duplicatePostId }
) => {
	const draftPostId = get( getHttpData( uniqueDraftKey ), 'data.ID', null );
	const post = getPost( siteId, postId || draftPostId, postType );
	const postCopy = getPost( siteId, duplicatePostId, postType );
	const demoContent = isDemoContent ? get( requestGutenbergDemoContent(), 'data' ) : null;
	// The post copy stored in httpData, will go stale after the block editor makes an update (save/publish)
	// So also check if postId is passed because this means that this post has been saved by
	// the user before.
	//
	// Provided that this doesn't cause a strange feedback loop, we may want to consider updating
	// the cached post in httpData when the editor store updates.
	const isAutoDraft = ! postId && 'auto-draft' === get( post, 'status', null );
	const isRTL = isRtlSelector( state );
	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' );
	const allowedFileTypes = getSiteOption( state, siteId, 'allowed_file_types' );

	/**
	 * We don't expect any theme to have a specific Gutenberg support flag,
	 * so, data.theme_support.gutenberg will always be false.
	 * This is future proofing if that flag get's implemented.
	 */
	const siteSlug = getSiteSlug( state, siteId );
	const { 'align-wide': alignWide, gutenberg: gutenbergThemeSupport } = get(
		requestActiveThemeSupport( siteSlug ),
		[ 'data', 'theme_support' ],
		{}
	);

	const pageTemplates = {
		'': translate( 'Default Template' ),
		...mapValues( keyBy( getPageTemplates( state, siteId ), 'file' ), 'label' ),
	};

	const initialEdits = getInitialEdits( {
		isAutoDraft,
		duplicatePostId,
		postCopy,
		isDemoContent,
		demoContent,
	} );

	return {
		//no theme uses the wide-images flag. This is future proofing in case it get's implemented.
		alignWide: alignWide || get( gutenbergThemeSupport, 'wide-images', false ),
		pageTemplates,
		post,
		initialEdits,
		isRTL,
		gmtOffset,
		allowedFileTypes,
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
