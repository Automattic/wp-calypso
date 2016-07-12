/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import { omit, get } from 'lodash';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import PostUtils from 'lib/posts/utils';
import SiteUtils from 'lib/site/utils';
import EditorPermalink from 'post-editor/editor-permalink';
import TrackInputChanges from 'components/track-input-changes';
import TextareaAutosize from 'components/textarea-autosize';
import { isMobile } from 'lib/viewport';
import * as stats from 'lib/posts/stats';

/**
 * Constants
 */
const REGEXP_NEWLINES = /[\r\n]+/g;

export default React.createClass( {
	displayName: 'EditorTitle',

	propTypes: {
		post: PropTypes.object,
		site: PropTypes.object,
		isNew: PropTypes.bool,
		onChange: PropTypes.func
	},

	getDefaultProps() {
		return {
			isNew: true,
			onChange: () => {}
		};
	},

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
	},

	onChange( event ) {
		if ( ! this.props.post ) {
			return;
		}

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			title: event.target.value.replace( REGEXP_NEWLINES, ' ' )
		} );
		this.props.onChange( event );
	},

	resizeAfterNewlineInput( event ) {
		const title = event.target.value;
		if ( REGEXP_NEWLINES.test( title ) ) {
			event.target.value = title.replace( REGEXP_NEWLINES, ' ' );
			this.refs.titleInput.resize();
		}
	},

	recordChangeStats() {
		const isPage = PostUtils.isPage( this.props.post );
		stats.recordStat( isPage ? 'page_title_changed' : 'post_title_changed' );
		stats.recordEvent( isPage ? 'Changed Page Title' : 'Changed Post Title' );
	},

	onBlur( event ) {
		this.onChange( event );
	},

	render() {
		const { post, site, isNew } = this.props;
		const isPermalinkEditable = SiteUtils.isPermalinkEditable( site );

		const classes = classNames( 'editor-title', {
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
					<TextareaAutosize
						{ ...omit( this.props, Object.keys( this.constructor.propTypes ) ) }
						className="editor-title__input"
						placeholder={ this.translate( 'Title' ) }
						onChange={ this.onChange }
						onInput={ this.resizeAfterNewlineInput }
						onBlur={ this.onBlur }
						autoFocus={ isNew && ! isMobile() }
						value={ post ? post.title : '' }
						aria-label={ this.translate( 'Edit title' ) }
						ref="titleInput"
						rows="1" />
				</TrackInputChanges>
			</div>
		);
	}
} );
