/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostUtils from 'lib/posts/utils';
import SiteUtils from 'lib/site/utils';
import EditorPermalink from 'post-editor/editor-permalink';
import TrackInputChanges from 'components/track-input-changes';
import TextareaAutosize from 'components/textarea-autosize';
import { isMobile } from 'lib/viewport';
import * as stats from 'lib/posts/stats';
import { getSelectedSite } from 'state/ui/selectors';
import { isEditorNewPost, getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { editPost } from 'state/posts/actions';

/**
 * Constants
 */
const REGEXP_NEWLINES = /[\r\n]+/g;

class EditorTitle extends Component {
	static propTypes = {
		editPost: PropTypes.func,
		isNew: PropTypes.bool,
		onChange: PropTypes.func,
		ownProps: PropTypes.object,
		post: PropTypes.object,
		site: PropTypes.object,
		translate: PropTypes.func
	};

	static defaultProps = {
		isNew: true,
		onChange: () => {}
	};

	componentDidUpdate( prevProps ) {
		if ( isMobile() ) {
			return;
		}

		// If next post is new, or the next site is different, focus title
		const { isNew, site } = this.props;
		if ( ( isNew && ! prevProps.isNew ) ||
				( isNew && get( prevProps.site, 'ID' ) !== get( site, 'ID' ) ) ) {
			const input = ReactDom.findDOMNode( this.refs.titleInput );
			input.focus();
		}
	}

	onChange = event => {
		if ( ! this.props.post ) {
			return;
		}

		this.props.editPost( this.props.site.ID, this.props.post.ID, {
			title: event.target.value.replace( REGEXP_NEWLINES, ' ' )
		} );
		this.props.onChange( event );
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

	onBlur = event => {
		this.onChange( event );
	};

	render() {
		const { ownProps, post, site, isNew, translate } = this.props;
		const isPermalinkEditable = SiteUtils.isPermalinkEditable( site );

		const classes = classNames( 'editor-title', {
			'is-loading': ! post
		} );

		return (
			<div className={ classes }>
				{ post && post.ID && ! PostUtils.isPage( post ) &&
					<EditorPermalink
						path={ isPermalinkEditable ? PostUtils.getPermalinkBasePath( post ) : post.URL }
						isEditable={ isPermalinkEditable } />
				}
				<TrackInputChanges onNewValue={ this.recordChangeStats }>
					<TextareaAutosize
						{ ...ownProps }
						className="editor-title__input"
						placeholder={ translate( 'Title' ) }
						onChange={ this.onChange }
						onInput={ this.resizeAfterNewlineInput }
						onBlur={ this.onBlur }
						autoFocus={ isNew && ! isMobile() }
						value={ post ? post.title : '' }
						aria-label={ translate( 'Edit title' ) }
						ref="titleInput"
						rows="1" />
				</TrackInputChanges>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const site = getSelectedSite( state );
		const editedPostId = getEditorPostId( state );
		const post = getEditedPost( state, site.ID, editedPostId );
		const isNew = isEditorNewPost( state );

		return {
			isNew,
			post,
			site,
			ownProps
		};
	},
	{ editPost }
)( localize( EditorTitle ) );
