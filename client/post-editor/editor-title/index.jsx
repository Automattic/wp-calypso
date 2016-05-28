/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import PostUtils from 'lib/posts/utils';
import SiteUtils from 'lib/site/utils';
import EditorPermalink from 'post-editor/editor-permalink';
import TrackInputChanges from 'components/track-input-changes';
import FormTextInput from 'components/forms/form-text-input';
import { isMobile } from 'lib/viewport';
import * as stats from 'lib/posts/stats';

export default React.createClass( {
	displayName: 'EditorTitle',

	propTypes: {
		post: PropTypes.object,
		site: PropTypes.object,
		isNew: PropTypes.bool,
		onChange: PropTypes.func
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
			( nextProps.isNew && ( this.props.site && nextProps.site ) && ( this.props.site.ID !== nextProps.site.ID ) )
		) {
			this.setState( {
				isFocused: true
			}, () => {
				this.refs.titleInput.focus();
			} );
		}
	},

	onChange( event ) {
		const { post, onChange } = this.props;

		if ( ! post ) {
			return;
		}

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			title: event.target.value
		} );

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
		const { post, site, isNew } = this.props;
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
						value={ post ? post.title : '' }
						aria-label={ this.translate( 'Edit title' ) }
						ref="titleInput" />
				</TrackInputChanges>
			</div>
		);
	}
} );
