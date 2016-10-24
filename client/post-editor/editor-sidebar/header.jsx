/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import get from 'lodash/get';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getEditorPostId, isEditorDraftsVisible } from 'state/ui/editor/selectors';
import { toggleEditorDraftsVisible } from 'state/ui/editor/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import DraftsButton from 'post-editor/drafts-button';

function EditorSidebarHeader( { translate, type, showDrafts, toggleDrafts, allPostsUrl, toggleSidebar } ) {
	const className = classnames( 'editor-sidebar__header', {
		'is-drafts-visible': showDrafts
	} );
	const closeLabel = translate( 'Back' );
	const closeButtonAction = page.back.bind( page, allPostsUrl );
	const closeButtonUrl = '';
	const closeButtonAriaLabel = translate( 'Go back' );

	return (
		<div className={ className }>
			{ showDrafts && (
				<Button
					compact borderless
					className="editor-sidebar__close"
					onClick={ toggleDrafts }
					aria-label={ translate( 'Close drafts list' ) }>
					<Gridicon icon="cross" />
					{ translate( 'Close' ) }
				</Button>
			) }
			{ ! showDrafts && (
				<Button
					compact borderless
					className="editor-sidebar__close"
					href={ closeButtonUrl }
					onClick={ closeButtonAction }
					aria-label={ closeButtonAriaLabel }>
					<Gridicon icon="arrow-left" size={ 18 } />
					{ closeLabel }
				</Button>
			) }
			{ type === 'post' && (
				<DraftsButton onClick={ toggleDrafts } />
			) }
			<Button
				onClick={ toggleSidebar }
				className="editor-sidebar__toggle-sidebar">
				<span>{ translate( 'Write' ) }</span>
			</Button>
		</div>
	);
}

EditorSidebarHeader.propTypes = {
	translate: PropTypes.func,
	type: PropTypes.string,
	showDrafts: PropTypes.bool,
	toggleDrafts: PropTypes.func,
	allPostsUrl: PropTypes.string,
	toggleSidebar: PropTypes.func
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return {
			type: get( getEditedPost( state, siteId, postId ), 'type' ),
			showDrafts: isEditorDraftsVisible( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			toggleDrafts: toggleEditorDraftsVisible
		}, dispatch );
	}
)( localize( EditorSidebarHeader ) );
