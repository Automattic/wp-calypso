/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { includes } from 'lodash';

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
		showPublishedStatus: PropTypes.bool.isRequired,
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
			case 'future':
			case 'pending':
				return this.props.post.modified;
			default:
				return this.props.post.date;
		}
	}

	getDisplayedTimeFromPost( post ) {
		const moment = this.props.moment;

		const now = moment();

		if ( ! post ) {
			// Placeholder text: "a few seconds ago" in English locale
			return now.fromNow();
		}

		const { status, modified, date } = post;
		const time = moment( includes( [ 'draft', 'pending', 'future' ], status ) ? modified : date );
		if ( now.diff( time, 'days' ) >= 7 ) {
			// Like "Mar 15, 2013 6:23 PM" in English locale
			return time.format( 'lll' );
		}

		// Like "3 days ago" in English locale
		return time.fromNow();
	}

	getTimeText() {
		const time = this.getTimestamp();
		if ( ! time ) {
			return null;
		}

		return (
			<span className="post-relative-time-status__time">
				<Gridicon icon="time" size={ this.props.gridiconSize || 18 } />
				<time className="post-relative-time-status__time-text" dateTime={ time }>
					{ this.getDisplayedTimeFromPost( this.props.post ) }
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
			const moment = this.props.moment;
			const now = moment();
			const scheduledDate = moment( this.props.post.date );
			// If the content is scheduled to be release within a year, do not display the year at the end
			const scheduledTime = scheduledDate.calendar( null, {
				sameElse: this.props.translate( 'll [at] LT', {
					comment:
						'll refers to date (eg. 21 Apr) & LT refers to time (eg. 18:00) - "at" is translated',
				} ),
			} );

			const displayScheduleTime =
				scheduledDate.diff( now, 'years' ) > 0
					? scheduledTime
					: scheduledTime.replace( scheduledDate.format( 'Y' ), '' );

			statusText = this.props.translate( 'scheduled for %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a scheduled post is set to be published',
				args: {
					displayScheduleTime,
				},
			} );
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
		const { post, showPublishedStatus } = this.props;
		const timeText = this.getTimeText();
		const statusText = this.getStatusText();
		const relativeTimeClass = timeText ? 'post-relative-time-status' : null;
		const time = this.getTimestamp();

		let innerText = (
			<span>
				{ timeText }
				{ ( post.status === 'future' || showPublishedStatus ) && statusText }
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
