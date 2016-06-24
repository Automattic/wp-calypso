/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal Dependencies
 */
import actions from 'lib/posts/actions';
import TrackInputChanges from 'components/track-input-changes';
import FormTextInput from 'components/forms/form-text-input';
import { recordStat, recordEvent } from 'lib/posts/stats';

export default React.createClass( {
	displayName: 'PostEditorSlug',

	mixins: [ PureRenderMixin ],

	propTypes: {
		path: PropTypes.string,
		slug: PropTypes.string,
		onEscEnter: PropTypes.func,
		className: PropTypes.string,
		isEditable: PropTypes.bool,
		postType: PropTypes.string,
		instanceName: PropTypes.string
	},

	getDefaultProps() {
		return {
			onEscEnter: noop,
			isEditable: true
		};
	},

	getInitialState() {
		return {
			isSlugFocused: false
		};
	},

	onSlugChange( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { slug: event.target.value } );
	},

	onSlugKeyDown( event ) {
		if ( event.key === 'Enter' || event.key === 'Escape' ) {
			this.setState( { isSlugFocused: false }, function() {
				this.props.onEscEnter();

				if ( this.props.isEditable ) {
					ReactDom.findDOMNode( this.refs.slugField ).blur();
				}
			} );
		}
	},

	onBlur() {
		if ( this.state.isSlugFocused ) {
			this.setState( { isSlugFocused: false } );
		}
	},

	onFocus() {
		this.setState( { isSlugFocused: true } );
	},

	focusSlug() {
		if ( this.props.isEditable ) {
			ReactDom.findDOMNode( this.refs.slugField ).focus();
		}
	},

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
	},

	render() {
		const wrapperClass = classNames( 'editor-slug', this.props.className, {
			'is-focused': this.state.isSlugFocused
		} );

		return (
			<div className={ wrapperClass } onClick={ this.focusSlug }>
				{ this.props.children }
				<span className="editor-slug__url-path" onClick={ this.focusSlug }>{ this.props.path }</span>
				{ this.props.isEditable ?
					<TrackInputChanges onNewValue={ this.recordChangeStats }>
						<FormTextInput
							ref="slugField"
							value={ this.props.slug ? this.props.slug : '' }
							onChange={ this.onSlugChange }
							onKeyDown={ this.onSlugKeyDown }
							onBlur={ this.onBlur }
							onFocus={ this.onFocus }
							aria-label={ this.translate( 'Enter slug' ) }
						/>
					</TrackInputChanges>
				:
					null
				}
			</div>
		);
	}
} );
