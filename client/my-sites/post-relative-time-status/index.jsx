/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export default localize( React.createClass( {

	displayName: 'PostRelativeTime',

	mixins: [ PureRenderMixin ],

	propTypes: {
		post: PropTypes.object.isRequired,
		includeNonDraftStatuses: PropTypes.bool,
		link: PropTypes.string,
		target: PropTypes.string
	},

	getDefaultProps: function() {
		return {
			includeNonDraftStatuses: false,
			link: null,
			target: null
		};
	},

	getTimestamp: function() {
		const status = this.props.post.status;

		let time;
		if ( status === 'draft' || status === 'pending' ) {
			time = this.props.post.modified;
		} else if ( status !== 'new' ) {
			time = this.props.post.date;
		}

		return time;
	},

	getRelativeTimeText: function() {
		const time = this.getTimestamp();
		if ( ! time ) {
			return;
		}

		return (
		    <span className="post-relative-time-status__time">
				<Gridicon icon="time" size={ 18 } />
				<time className="post-relative-time-status__time-text" dateTime={ time }>
					{ this.props.moment( time ).fromNow() }
				</time>
			</span>
		);
	},

	getStatusText: function() {
		let status = this.props.post.status,
			statusClassName = 'post-relative-time-status__status',
			statusIcon = 'aside',
			statusText;

		if ( this.props.post.sticky ) {
			statusText = this.props.translate( 'sticky' );
			statusClassName += ' is-sticky';
			statusIcon = 'bookmark-outline';
		} else if ( status === 'pending' ) {
			statusText = this.props.translate( 'pending review' );
			statusClassName += ' is-pending';
		} else if ( status === 'future' ) {
			statusText = this.props.translate( 'scheduled' );
			statusClassName += ' is-scheduled';
			statusIcon = 'calendar';
		} else if ( status === 'trash' ) {
			statusText = this.props.translate( 'trashed' );
			statusClassName += ' is-trash';
			statusIcon = 'trash';
		} else if ( this.props.includeBasicStatus ) {
			if ( status === 'draft' ) {
				statusText = this.props.translate( 'draft' );
			} else if ( status === 'publish' ) {
				statusText = this.props.translate( 'published' );
			} else if ( status === 'new' ) {
				statusText = this.props.translate( 'Publish immediately' );
			}
		}

		if ( statusText ) {
			return (
				<span className={ statusClassName }>
					<Gridicon icon={ statusIcon } size={ 18 } />
					<span className="post-relative-time-status__status-text">
						{ statusText }
					</span>
				</span>
			);
		}
	},

	render: function() {
		let timeText = this.getRelativeTimeText(),
			statusText = this.getStatusText(),
			relativeTimeClass = ( timeText ) ? 'post-relative-time-status' : null,
			innerText = ( <span>{ timeText }{ statusText }</span> ),
			time = this.getTimestamp();

		if ( this.props.link ) {
			const rel = this.props.target === '_blank' ? 'noopener noreferrer' : null;
			innerText = (
				<a href={ this.props.link } target={ this.props.target } rel={ rel } onClick={ this.props.onClick }>{ innerText }</a>
			);
		}

		return (
			<p className={ relativeTimeClass } title={ time }>
				{ innerText }
			</p>
		);
	}
} ) );
