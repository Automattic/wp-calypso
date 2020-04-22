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
		showPublishedStatus: PropTypes.bool.isRequired,
		post: PropTypes.object.isRequired,
		link: PropTypes.string,
		target: PropTypes.string,
		gridiconSize: PropTypes.number,
	};

	static defaultProps = {
		link: null,
		target: null,
	};

	/**
	 * Get the date to be displayed depending on the status of the post
	 */
	getTimestamp() {
		switch ( this.props.post.status ) {
			case 'new':
				return null;

			case 'draft':
			case 'trash':
			case 'pending':
				return this.props.post.modified;

			case 'future':
			default:
				return this.props.post.date;
		}
	}

	getDisplayedTimeForLabel() {
		const moment = this.props.moment;
		const now = moment();
		const scheduledDate = moment( this.getTimestamp() );

		const isScheduledPost = this.props.post.status === 'future';

		let scheduledTime;
		if ( isScheduledPost ) {
			scheduledTime = scheduledDate.calendar( null, {
				nextDay: this.props.translate( '[for tomorrow at] LT', {
					comment: 'LT refers to time (eg. 18:00)',
				} ),
				sameElse: this.props.translate( '[for] ll [at] LT', {
					comment:
						'll refers to date (eg. 21 Apr) for when the post will be published & LT refers to time (eg. 18:00) - "at" and "for" is translated',
				} ),
			} );
		} else {
			if ( Math.abs( now.diff( this.getTimestamp(), 'days' ) ) < 7 ) {
				const time = moment( this.getTimestamp() );
				return time.fromNow();
			}

			scheduledTime = scheduledDate.calendar( null, {
				sameElse: this.props.translate( '[on] ll [at] LT', {
					comment:
						'll refers to date (eg. 21 Apr) & LT refers to time (eg. 18:00) - "at" and "on" is translated',
				} ),
			} );
		}

		// If the content is scheduled to be release within a year, do not display the year at the end
		return scheduledDate.diff( now, 'years' ) > 0
			? scheduledTime
			: scheduledTime.replace( scheduledDate.format( 'Y' ), '' );
	}

	getTimeText() {
		const time = this.getTimestamp();
		return (
			<span className="post-relative-time-status__time">
				{ time && (
					<>
						<Gridicon icon="time" size={ this.props.gridiconSize || 18 } />
						<time className="post-relative-time-status__time-text" dateTime={ time }>
							{ this.getDisplayedTimeForLabel() }
						</time>
					</>
				) }
			</span>
		);
	}

	/**
	 * Get status label
	 *
	 * @param {boolean} onlySticky sends back the "sticky" label. Special case as is using the same template but for is unrelated to the status
	 *
	 */
	getStatusText( onlySticky = false ) {
		const status = this.props.post.status;
		let statusClassName = 'post-relative-time-status__status';
		let statusIcon = 'aside';
		let statusText;

		if ( onlySticky ) {
			statusText = this.props.translate( 'sticky' );
			statusClassName += ' is-sticky';
			statusIcon = 'bookmark-outline';
		} else if ( status === 'pending' ) {
			statusClassName += ' is-pending';
			const displayScheduleTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'pending review last modified %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a pending review post or page was last modified',
				args: {
					displayScheduleTime,
				},
			} );
		} else if ( status === 'trash' ) {
			statusClassName += ' is-trash';
			statusIcon = 'trash';
			const displayScheduleTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'trashed %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a post or page was trashed',
				args: {
					displayScheduleTime,
				},
			} );
		} else if ( status === 'future' ) {
			statusClassName += ' is-scheduled';
			statusIcon = 'calendar';
			const displayScheduleTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'scheduled %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a scheduled post or page is set to be published',
				args: {
					displayScheduleTime,
				},
			} );
		} else if ( status === 'draft' ) {
			const displayScheduleTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'draft last modified %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a draft post or page was last modified',
				args: {
					displayScheduleTime,
				},
			} );
		} else if ( status === 'publish' ) {
			const displayScheduleTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'published on %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a post or page was last modified',
				args: {
					displayScheduleTime,
				},
			} );
		} else if ( status === 'private' ) {
			const displayScheduleTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'private last modified %(displayScheduleTime)s', {
				comment: '%(displayScheduleTime)s is when a private post or page was last modified',
				args: {
					displayScheduleTime,
				},
			} );
		} else if ( status === 'new' ) {
			statusText = this.props.translate( 'Publish immediately' );
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
		const { showPublishedStatus, post } = this.props;
		const timeText = this.getTimeText();
		let innerText = (
			<span>
				{ showPublishedStatus ? this.getStatusText() : timeText }
				{ post.sticky && this.getStatusText( true ) }
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

		const relativeTimeClass = timeText ? 'post-relative-time-status' : null;
		const time = this.getTimestamp();
		return (
			<div className={ relativeTimeClass } title={ time }>
				{ innerText }
			</div>
		);
	}
}

export default localize( withLocalizedMoment( PostRelativeTime ) );
