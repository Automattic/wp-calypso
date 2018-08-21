/**
 * External dependencies
 *
 * @format
 */
import React from 'react';
import { findLast } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { withViewportMatch } from '@wordpress/viewport';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Inserter,
	BlockToolbar,
	TableOfContents,
	EditorHistoryRedo,
	EditorHistoryUndo,
	NavigableToolbar,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Drafts from 'layout/masterbar/drafts';
import Site from 'blocks/site';
import { addSiteFragment } from 'lib/route';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { getRouteHistory } from 'state/ui/action-log/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */
function HeaderToolbar( {
	closeEditor,
	hasFixedToolbar,
	isLargeViewport,
	recordSiteButtonClick,
	site,
	translate,
} ) {
	const onCloseButtonClick = () => closeEditor();

	return (
		<NavigableToolbar className="edit-post-header-toolbar" aria-label={ __( 'Editor Toolbar' ) }>
			<Button
				borderless
				className="edit-post-header-toolbar__back"
				onClick={ onCloseButtonClick }
				aria-label={ translate( 'Close' ) }
			>
				{ translate( 'Close' ) }
			</Button>
			<Site compact site={ site } indicator={ false } onSelect={ recordSiteButtonClick } />
			<Drafts />
			<Inserter position="bottom right" />
			<EditorHistoryUndo />
			<EditorHistoryRedo />
			<TableOfContents />
			{ hasFixedToolbar &&
				isLargeViewport && (
					<div className="edit-post-header-toolbar__block-toolbar">
						<BlockToolbar />
					</div>
				) }
		</NavigableToolbar>
	);
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

function getCloseButtonPath( routeHistory, site ) {
	const editorPathRegex = /^\/gutenberg\/(post|page|(edit\/[^\/]+))\/[^\/]+(\/\d+)?$/i;
	const lastEditorPath = routeHistory[ routeHistory.length - 1 ].path;

	// @see post-editor/editor-ground-control/index.jsx
	const lastNonEditorPath = findLast(
		routeHistory,
		action => ! action.path.match( editorPathRegex )
	);
	if ( lastNonEditorPath ) {
		return lastNonEditorPath.path;
	}

	const editorPostType = lastEditorPath.match( editorPathRegex )[ 1 ];
	let path;

	// @see post-editor/post-editor.jsx
	if ( 'post' === editorPostType ) {
		path = '/posts';
	} else if ( 'page' === editorPostType ) {
		path = '/pages';
	} else {
		path = `/types/${ editorPostType.split( '/' )[ 1 ] }`;
	}
	if ( 'post' === editorPostType && site && ! site.jetpack && ! site.single_user_site ) {
		path += '/my';
	}
	if ( site ) {
		path = addSiteFragment( path, site.slug );
	}
	return path;
}

const mapStateToProps = state => ( {
	routeHistory: getRouteHistory( state ),
	site: getSelectedSite( state ),
} );

const mapDispatchToProps = dispatch => {
	return {
		closeEditor: ( { routeHistory, site } ) =>
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_gutenberg_editor_close_button_click' ),
					navigate( getCloseButtonPath( routeHistory, site ) )
				)
			),
		recordSiteButtonClick: () =>
			dispatch( recordTracksEvent( 'calypso_gutenberg_editor_site_button_click' ) ),
	};
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		closeEditor: () => dispatchProps.closeEditor( stateProps ),
	};
};

export default compose( [
	withSelect( select => ( {
		hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
	} ) ),
	withViewportMatch( { isLargeViewport: 'medium' } ),
] )(
	connect(
		mapStateToProps,
		mapDispatchToProps,
		mergeProps
	)( localize( HeaderToolbar ) )
);
