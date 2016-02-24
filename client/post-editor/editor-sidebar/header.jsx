/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import get from 'lodash/get';
import { translate } from 'lib/mixins/i18n';
import noop from 'lodash/noop';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getEditorPostId, isEditorDraftsVisible } from 'state/ui/editor/selectors';
import { toggleEditorDraftsVisible } from 'state/ui/editor/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import DraftsButton from 'post-editor/drafts-button';
import PostCountsData from 'components/data/post-counts-data';
import QueryPostTypes from 'components/data/query-post-types';

function EditorSidebarHeader( { typeSlug, type, siteId, showDrafts, toggleDrafts, allPostsUrl, toggleSidebar } ) {
	const isCustomPostType = ( 'post' !== typeSlug && 'page' !== typeSlug );
	const className = classnames( 'editor-sidebar__header', {
		'is-drafts-visible': showDrafts,
		'is-loading': isCustomPostType && ! type
	} );
	const useBackButton = page.len > 0;
	let closeLabel;
	if ( useBackButton ) {
		closeLabel = translate( 'Back' );
	} else {
		switch ( typeSlug ) {
			case 'post': closeLabel = translate( 'Posts' ); break;
			case 'page': closeLabel = translate( 'Pages' ); break;
			default: closeLabel = get( type, 'labels.menu_name' ) || translate( 'Loading…' );
		}
	}
	const closeButtonAction = useBackButton ? page.back : noop;
	const closeButtonUrl = useBackButton ? '' : allPostsUrl;
	const closeButtonAriaLabel = useBackButton ? translate( 'Go back' ) : translate( 'View list of posts' );

	return (
		<div className={ className }>
			{ isCustomPostType && (
				<QueryPostTypes siteId={ siteId } />
			) }
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
			{ typeSlug === 'post' && siteId && (
				<PostCountsData siteId={ siteId } status="draft">
					<DraftsButton onClick={ toggleDrafts } />
				</PostCountsData>
			) }
			<Button
				onClick={ toggleSidebar }
				className="editor-sidebar__toggle-sidebar">
				<span>{ translate( 'Write' ) }</span>
			</Button>
		</div>
	);
}

export default connect(
	( state ) => {
		const siteId = get( getSelectedSite( state ), 'ID' );
		const postId = getEditorPostId( state );
		const typeSlug = get( getEditedPost( state, siteId, postId ), 'type' );

		return {
			siteId,
			typeSlug,
			type: getPostType( state, siteId, typeSlug ),
			showDrafts: isEditorDraftsVisible( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			toggleDrafts: toggleEditorDraftsVisible
		}, dispatch );
	}
)( EditorSidebarHeader );
