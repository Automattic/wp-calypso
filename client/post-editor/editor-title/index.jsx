/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostUtils from 'lib/posts/utils';
import SiteUtils from 'lib/site/utils';
import EditorPermalink from 'post-editor/editor-permalink';
import TrackInputChanges from 'components/track-input-changes';
import FormTextInput from 'components/forms/form-text-input';
import { isMobile } from 'lib/viewport';
import * as stats from 'lib/posts/stats';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { editPost } from 'state/posts/actions';
import { getEditedPostValue } from 'state/posts/selectors';

const EditorTitle = React.createClass( {
	propTypes: {
		post: PropTypes.object,
		site: PropTypes.object,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		isNew: PropTypes.bool,
		onChange: PropTypes.func,
		editPost: PropTypes.func,
		title: PropTypes.string
	},

	getInitialState() {
		return {
			isFocused: false
		};
	},

	getDefaultProps() {
		return {
			isNew: true,
			onChange: () => {}
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( isMobile() ) {
			return;
		}

		// If next post is new, or the next site is different, focus title
		if ( nextProps.isNew && ! this.props.isNew ||
			( nextProps.isNew && this.props.siteId !== nextProps.siteId )
		) {
			this.setState( {
				isFocused: true
			}, () => {
				this.refs.titleInput.focus();
			} );
		}
	},

	onChange( event ) {
		const { siteId, postId, onChange } = this.props;
		const title = event.target.value;
		this.props.editPost( { title }, siteId, postId );
		onChange( event );
	},

	recordChangeStats() {
		const isPage = PostUtils.isPage( this.props.post );
		stats.recordStat( isPage ? 'page_title_changed' : 'post_title_changed' );
		stats.recordEvent( isPage ? 'Changed Page Title' : 'Changed Post Title' );
	},

	onBlur( event ) {
		this.setState( {
			isFocused: false
		} );

		this.onChange( event );

		event.target.scrollLeft = 0;
	},

	onFocus() {
		this.setState( {
			isFocused: true
		} );
	},

	render() {
		const { post, site, title, isNew } = this.props;
		const isPermalinkEditable = SiteUtils.isPermalinkEditable( site );

		const classes = classNames( 'editor-title', {
			'is-focused': this.state.isFocused,
			'is-loading': ! post
		} );

		return (
			<div className={ classes }>
				{ post && post.ID && ! PostUtils.isPage( post ) &&
					<EditorPermalink
						slug={ post.slug }
						path={ isPermalinkEditable ? PostUtils.getPermalinkBasePath( post ) : post.URL }
						isEditable={ isPermalinkEditable } />
				}
				<TrackInputChanges onNewValue={ this.recordChangeStats }>
					<FormTextInput
						{ ...omit( this.props, Object.keys( this.constructor.propTypes ) ) }
						className="editor-title__input"
						placeholder={ this.translate( 'Title' ) }
						onChange={ this.onChange }
						onBlur={ this.onBlur }
						onFocus={ this.onFocus }
						autoFocus={ isNew && ! isMobile() }
						value={ title }
						aria-label={ this.translate( 'Edit title' ) }
						ref="titleInput" />
				</TrackInputChanges>
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return {
			site,
			siteId,
			postId,
			title: getEditedPostValue( state, siteId, postId, 'title' )
		};
	},
	{ editPost },
	null,
	{ pure: false }
)( EditorTitle );
