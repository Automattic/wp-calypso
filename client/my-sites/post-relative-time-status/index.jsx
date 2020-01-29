/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class PostRelativeTime extends React.PureComponent {
	static propTypes = {
		post: PropTypes.object.isRequired,
		includeNonDraftStatuses: PropTypes.bool,
		link: PropTypes.string,
		target: PropTypes.string,
		gridiconSize: PropTypes.number,
	};

	static defaultProps = {
		includeNonDraftStatuses: false,
		link: null,
		target: null,
	};

	getTimestamp() {
		switch ( this.props.post.status ) {
			case 'new':
				return null;
			case 'draft':
			case 'pending':
				return this.props.post.modified;
			default:
				return this.props.post.date;
		}
	}

	getRelativeTimeText() {
		const time = this.getTimestamp();
		if ( ! time ) {
			return null;
		}

		return (
			<span className="post-relative-time-status__time">
				<Gridicon icon="time" size={ this.props.gridiconSize || 18 } />
				<time className="post-relative-time-status__time-text" dateTime={ time }>
					{ this.props.moment( time ).fromNow() }
				</time>
			</span>
		);
	}

	getStatusText() {
		const status = this.props.post.status;
		let statusClassName = 'post-relative-time-status__status';
		let statusIcon = 'aside';
		let statusText;

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
					<Gridicon icon={ statusIcon } size={ this.props.gridiconSize || 18 } />
					<span className="post-relative-time-status__status-text">{ statusText }</span>
				</span>
			);
		}
	}

	render() {
		const timeText = this.getRelativeTimeText();
		const statusText = this.getStatusText();
		const relativeTimeClass = timeText ? 'post-relative-time-status' : null;
		const time = this.getTimestamp();

		let innerText = (
			<span>
				{ timeText }
				{ statusText }
			</span>
		);

		if ( this.props.link ) {
			const rel = this.props.target === '_blank' ? 'noopener noreferrer' : null;
			innerText = (
				<a
					className="post-relative-time-status__link"
					href={ this.props.link }
					target={ this.props.target }
					rel={ rel }
					onClick={ this.props.onClick }
				>
					{ innerText }
				</a>
			);
		}

		return (
			<div className={ relativeTimeClass } title={ time }>
				{ innerText }
			</div>
		);
	}
}

export default localize( withLocalizedMoment( PostRelativeTime ) );
