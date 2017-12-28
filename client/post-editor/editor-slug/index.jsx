/** @format */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import TrackInputChanges from 'client/components/track-input-changes';
import FormTextInput from 'client/components/forms/form-text-input';
import { recordStat, recordEvent } from 'client/lib/posts/stats';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getEditedPostSlug } from 'client/state/posts/selectors';
import { editPost } from 'client/state/posts/actions';

class PostEditorSlug extends Component {
	static propTypes = {
		path: PropTypes.string,
		slug: PropTypes.string,
		onEscEnter: PropTypes.func,
		className: PropTypes.string,
		isEditable: PropTypes.bool,
		instanceName: PropTypes.string,
		translate: PropTypes.func,
		siteId: PropTypes.number,
		postId: PropTypes.number,
	};

	static defaultProps = {
		onEscEnter: () => {},
		isEditable: true,
		slug: '',
	};

	constructor() {
		super( ...arguments );
		this.state = { isSlugFocused: false };

		this.onSlugKeyDown = this.onSlugKeyDown.bind( this );
		this.onSlugChange = this.onSlugChange.bind( this );
		this.onBlur = this.onBlur.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.focusSlug = this.focusSlug.bind( this );
		this.recordChangeStats = this.recordChangeStats.bind( this );
		this.statTracked = false;
	}

	onSlugChange( event ) {
		const { siteId, postId } = this.props;
		this.props.editPost( siteId, postId, { slug: event.target.value } );
	}

	onSlugKeyDown( event ) {
		if ( event.key === 'Enter' || event.key === 'Escape' ) {
			const { onEscEnter, isEditable } = this.props;
			this.setState( { isSlugFocused: false }, function() {
				onEscEnter();

				if ( isEditable ) {
					ReactDom.findDOMNode( this.refs.slugField ).blur();
				}
			} );
		}
	}

	onBlur() {
		if ( this.state.isSlugFocused ) {
			this.setState( { isSlugFocused: false } );
		}
	}

	onFocus() {
		this.setState( { isSlugFocused: true } );
	}

	focusSlug() {
		if ( this.props.isEditable ) {
			ReactDom.findDOMNode( this.refs.slugField ).focus();
		}
	}

	recordChangeStats() {
		switch ( this.props.instanceName ) {
			case 'post-sidebar':
				recordStat( 'slug-edited-post-sidebar' );
				recordEvent( 'Slug Edited (Post Sidebar)' );
				break;

			case 'post-popover':
				recordStat( 'slug-edited-post-popover' );
				recordEvent( 'Slug Edited (Post Permalink Popover)' );
				break;

			case 'page-sidebar':
				recordStat( 'slug-edited-page-sidebar' );
				recordEvent( 'Slug Edited (Page Sidebar)' );
				break;

			case 'page-permalink':
				recordStat( 'slug-edited-page-permalink' );
				recordEvent( 'Slug Edited (Page Permalink)' );
				break;
		}
	}

	render() {
		const { className, translate, slug, children, path, isEditable } = this.props;
		const wrapperClass = classNames( 'editor-slug', className, {
			'is-focused': this.state.isSlugFocused,
		} );

		return (
			<div className={ wrapperClass } onClick={ this.focusSlug }>
				{ children }
				<span className="editor-slug__url-path" onClick={ this.focusSlug }>
					{ path }
				</span>
				{ isEditable && (
					<TrackInputChanges onNewValue={ this.recordChangeStats }>
						<FormTextInput
							ref="slugField"
							value={ slug }
							onChange={ this.onSlugChange }
							onKeyDown={ this.onSlugKeyDown }
							onBlur={ this.onBlur }
							onFocus={ this.onFocus }
							aria-label={ translate( 'Enter slug' ) }
						/>
					</TrackInputChanges>
				) }
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const slug = getEditedPostSlug( state, siteId, postId );

		return { siteId, postId, slug };
	},
	{ editPost }
)( localize( PostEditorSlug ) );
