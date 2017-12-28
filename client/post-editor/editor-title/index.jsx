/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostUtils from 'client/lib/posts/utils';
import EditorPermalink from 'client/post-editor/editor-permalink';
import TrackInputChanges from 'client/components/track-input-changes';
import TextareaAutosize from 'client/components/textarea-autosize';
import { isMobile } from 'client/lib/viewport';
import * as stats from 'client/lib/posts/stats';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { areSitePermalinksEditable } from 'client/state/selectors';
import { isEditorNewPost, getEditorPostId } from 'client/state/ui/editor/selectors';
import { getEditedPost } from 'client/state/posts/selectors';
import { editPost } from 'client/state/posts/actions';

/**
 * Constants
 */
const REGEXP_NEWLINES = /[\r\n]+/g;

class EditorTitle extends Component {
	static propTypes = {
		editPost: PropTypes.func,
		isNew: PropTypes.bool,
		onChange: PropTypes.func,
		post: PropTypes.object,
		site: PropTypes.object,
		siteId: PropTypes.number,
		tabIndex: PropTypes.number,
		translate: PropTypes.func,
	};

	static defaultProps = {
		isNew: true,
		onChange: () => {},
	};

	componentDidUpdate( prevProps ) {
		if ( isMobile() ) {
			return;
		}

		// If next post is new, or the next site is different, focus title
		const { isNew, siteId } = this.props;
		if ( ( isNew && ! prevProps.isNew ) || ( isNew && prevProps.siteId !== siteId ) ) {
			const input = ReactDom.findDOMNode( this.refs.titleInput );
			input.focus();
		}
	}

	onChange = event => {
		const { siteId, editedPostId } = this.props;
		const newTitle = event.target.value.replace( REGEXP_NEWLINES, ' ' );
		this.props.editPost( siteId, editedPostId, {
			title: newTitle,
		} );
		this.props.onChange( newTitle );
	};

	resizeAfterNewlineInput = event => {
		const title = event.target.value;
		if ( REGEXP_NEWLINES.test( title ) ) {
			event.target.value = title.replace( REGEXP_NEWLINES, ' ' );
			this.refs.titleInput.resize();
		}
	};

	recordChangeStats = () => {
		const isPage = PostUtils.isPage( this.props.post );
		stats.recordStat( isPage ? 'page_title_changed' : 'post_title_changed' );
		stats.recordEvent( isPage ? 'Changed Page Title' : 'Changed Post Title' );
	};

	render() {
		const { post, isPermalinkEditable, isNew, tabIndex, translate } = this.props;

		const classes = classNames( 'editor-title', {
			'is-loading': ! post,
		} );

		return (
			<div className={ classes }>
				{ post &&
					post.ID &&
					! PostUtils.isPage( post ) && (
						<EditorPermalink
							path={ isPermalinkEditable ? PostUtils.getPermalinkBasePath( post ) : post.URL }
							isEditable={ isPermalinkEditable }
						/>
					) }
				<TrackInputChanges onNewValue={ this.recordChangeStats }>
					<TextareaAutosize
						tabIndex={ tabIndex }
						className="editor-title__input"
						placeholder={ translate( 'Title' ) }
						onChange={ this.onChange }
						onInput={ this.resizeAfterNewlineInput }
						onBlur={ this.onBlur }
						autoFocus={ isNew && ! isMobile() }
						value={ post && post.title ? post.title : '' }
						aria-label={ translate( 'Edit title' ) }
						ref="titleInput"
						rows="1"
					/>
				</TrackInputChanges>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isPermalinkEditable = areSitePermalinksEditable( state, siteId );
		const editedPostId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, editedPostId );
		const isNew = isEditorNewPost( state );

		return {
			editedPostId,
			isPermalinkEditable,
			isNew,
			post,
			siteId,
		};
	},
	{ editPost }
)( localize( EditorTitle ) );
