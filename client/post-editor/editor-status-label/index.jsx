/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import EditorStatusLabelPlaceholder from './placeholder';
import postUtils from 'lib/posts/utils';

export default localize( React.createClass( {
	displayName: 'StatusLabel',

	propTypes: {
		onClick: PropTypes.func,
		post: PropTypes.object,
		type: PropTypes.string,
		advancedStatus: PropTypes.bool
	},

	mixins: [ PureRenderMixin ],

	getDefaultProps: function() {
		return {
			onClick: null,
			post: null,
			advancedStatus: false,
			type: 'post'
		};
	},

	getInitialState: function() {
		return {
			currentTime: Date.now()
		};
	},

	componentDidMount: function() {
		// update the `currentTime` every minute
		this.currentTimeTimer = setInterval( this.updateCurrentTime, 60000 );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.post !== this.props.post ) {
			// the post has been updated, so update the current time so that
			// it will be the most up-to-date when re-rendering
			this.updateCurrentTime();
		}
	},

	componentWillUnmount: function() {
		clearInterval( this.currentTimeTimer );
	},

	render: function() {
		let statusClass = 'editor-status-label';

		if ( ! this.props.post ) {
			return <EditorStatusLabelPlaceholder className={ statusClass } />;
		}

		statusClass = classNames( statusClass, 'is-' + this.props.post.status );

		if ( ! this.props.onClick ) {
			return (
				<span className={ classNames( statusClass, 'is-plain' ) }>
					{ this.renderLabel() }
				</span>
			);
		}

		return (
		    <button
				className={ statusClass }
				onClick={ this.props.onClick }
				ref="statusLabel"
				aria-label={ this.props.translate( 'Show advanced status details' ) }
				aria-pressed={ !! this.props.advancedStatus }
				role="alert"
				aria-live="polite"
			>
				<Gridicon icon="cog" size={ 18 } />
				{ this.renderLabel() }
			</button>
		);
	},

	renderLabel: function() {
		let post = this.props.post,
			editedTime = this.props.moment( postUtils.getEditedTime( post ) ),
			label;

		if ( ! post.modified ) {
			return this.props.translate( 'New Draft' );
		}

		// prevent JP sites from showing a draft as saved in the future
		if ( 'draft' === post.status &&
				editedTime.isAfter( this.state.currentTime )
		) {
			editedTime = this.props.moment( this.state.currentTime );
		}

		const timeFromNow = editedTime.from( this.state.currentTime );

		switch ( post.status ) {
			case 'publish':
				label = this.props.translate( '{{strong}}Published{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'private':
				label = this.props.translate( '{{strong}}Published Privately{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'draft':
				label = this.props.translate( '{{strong}}Saved{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'pending':
				label = this.props.translate( '{{strong}}Pending Review{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'future':
				label = this.props.translate( '{{strong}}Scheduled{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'trash':
				label = this.props.translate( '{{strong}}Trashed{{/strong}}', {
					components: {
						strong: <strong />
					}
				} );
				break;
			default:
				label = '';
				break;
		}

		return label;
	},

	updateCurrentTime: function() {
		this.setState( {
			currentTime: Date.now()
		} );
	}
} ) );
