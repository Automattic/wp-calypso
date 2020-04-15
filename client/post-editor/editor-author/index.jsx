/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import AuthorSelector from 'blocks/author-selector';
import { hasTouch } from 'lib/touch-detect';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, isEditorNewPost } from 'state/ui/editor/selectors';
import { getSite } from 'state/sites/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { editPost } from 'state/posts/actions';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class EditorAuthor extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		author: PropTypes.object,
		isNew: PropTypes.bool,
	};

	render() {
		const { post, author, translate, site } = this.props;

		// if it's not a new post and we are still loading, show a placeholder component
		if ( ! post && ! this.props.isNew ) {
			return this.renderPlaceholder();
		}

		const name = author.display_name || author.name;
		const Wrapper = this.userCanAssignAuthor() ? AuthorSelector : 'div';
		const popoverPosition = hasTouch() ? 'bottom right' : 'bottom left';
		const wrapperProps = this.userCanAssignAuthor()
			? {
					siteId: site.ID,
					onSelect: this.onSelect,
					popoverPosition,
			  }
			: {};

		return (
			<div className="editor-author">
				<Wrapper { ...wrapperProps }>
					<Gravatar size={ 26 } user={ author } />
					<span className="editor-author__name">
						{ translate( 'by %(name)s', { args: { name: name } } ) }
					</span>
				</Wrapper>
			</div>
		);
	}

	renderPlaceholder() {
		return (
			<div className="editor-author is-placeholder">
				<Gravatar size={ 26 } />
				<span className="editor-author__name" />
			</div>
		);
	}

	onSelect = ( author ) => {
		this.props.recordEditorStat( 'advanced_author_changed' );
		this.props.recordEditorEvent( 'Changed Author' );

		const siteId = get( this.props.site, 'ID', null );
		const postId = get( this.props.post, 'ID', null );
		this.props.editPost( siteId, postId, { author } );
	};

	userCanAssignAuthor() {
		const { post, site } = this.props;
		if ( ! post ) {
			return false;
		}
		const reassignCapability = 'edit_others_' + post.type + 's';

		// if user cannot edit others posts
		if ( ! site || ! site.capabilities || ! site.capabilities[ reassignCapability ] ) {
			return false;
		}

		return true;
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const isNew = isEditorNewPost( state );

		const site = getSite( state, siteId );
		const post = getEditedPost( state, siteId, postId );
		const postAuthor = get( post, 'author' );
		//default to current user when null or falsey
		const author = postAuthor ? postAuthor : getCurrentUser( state );

		return { site, post, author, isNew };
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditorAuthor ) );
