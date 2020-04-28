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

			default:
				return this.props.post.date;
		}
	}

	getDisplayedTimeForLabel( prefix = true ) {
		const moment = this.props.moment;
		const now = moment();
		const timestamp = moment( this.getTimestamp() );

		const isScheduledPost = this.props.post.status === 'future';

		let displayedTime;
		if ( isScheduledPost ) {
			displayedTime = timestamp.calendar( null, {
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

			let sameElseTranslation;
			if ( ! prefix ) {
				sameElseTranslation = this.props.translate( 'll [at] LT', {
					comment:
						'll refers to date (eg. 21 Apr) & LT refers to time (eg. 18:00) - "at" is translated',
				} );
			} else {
				sameElseTranslation = this.props.translate( '[on] ll [at] LT', {
					comment:
						'll refers to date (eg. 21 Apr) & LT refers to time (eg. 18:00) - "at" and "on" is translated',
				} );
			}

			displayedTime = timestamp.calendar( null, {
				sameElse: sameElseTranslation,
			} );
		}

		// If the content is scheduled to be release within a year, do not display the year at the end
		return timestamp.diff( now, 'years' ) > 0
			? displayedTime
			: displayedTime.replace( timestamp.format( 'Y' ), '' );
	}

	getTimeText() {
		const time = this.getTimestamp();
		return (
			<span className="post-relative-time-status__time">
				{ time && (
					<>
						<Gridicon icon="time" size={ this.props.gridiconSize || 18 } />
						<time className="post-relative-time-status__time-text" dateTime={ time }>
							{ this.getDisplayedTimeForLabel( true ) }
						</time>
					</>
				) }
			</span>
		);
	}

	/**
	 * Get status label
	 */
	getStatusText() {
		const status = this.props.post.status;
		let extraStatusClassName;
		let statusIcon;
		let statusText;

		if ( status === 'trash' ) {
			extraStatusClassName = 'is-trash';
			statusIcon = 'trash';
			const displayedTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'trashed %(displayedTime)s', {
				comment: '%(displayedTime)s is when a post or page was trashed',
				args: {
					displayedTime,
				},
			} );
		} else if ( status === 'future' ) {
			extraStatusClassName = 'is-scheduled';
			statusIcon = 'calendar';
			const displayedTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'scheduled %(displayedTime)s', {
				comment: '%(displayedTime)s is when a scheduled post or page is set to be published',
				args: {
					displayedTime,
				},
			} );
		} else if ( status === 'draft' || status === 'pending' ) {
			const displayedTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'draft last modified %(displayedTime)s', {
				comment: '%(displayedTime)s is when a draft post or page was last modified',
				args: {
					displayedTime,
				},
			} );
		} else if ( status === 'publish' ) {
			const displayedTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'published %(displayedTime)s', {
				comment: '%(displayedTime)s is when a post or page was last modified',
				args: {
					displayedTime,
				},
			} );
		} else if ( status === 'private' ) {
			const displayedTime = this.getDisplayedTimeForLabel();
			statusText = this.props.translate( 'private last modified %(displayedTime)s', {
				comment: '%(displayedTime)s is when a private post or page was last modified',
				args: {
					displayedTime,
				},
			} );
		} else if ( status === 'new' ) {
			statusText = this.props.translate( 'Publish immediately' );
		}

		return this.getLabel( statusText, extraStatusClassName, statusIcon );
	}

	/**
	 * Get "sticky" label
	 */
	getStickyLabel() {
		return this.getLabel( this.props.translate( 'sticky' ), 'is-sticky', 'bookmark-outline' );
	}

	/**
	 * Get "Pending" label
	 */
	getPendingLabel() {
		return this.getLabel( this.props.translate( 'pending review' ), 'is-pending' );
	}

	/**
	 * Get Label for the status
	 *
	 * @param {string} statusText text status
	 * @param {string} extraStatusClassName extra CSS class to be added to the label
	 * @param {string} [statusIcon="aside"] icon for the label
	 */
	getLabel( statusText, extraStatusClassName, statusIcon = 'aside' ) {
		if ( statusText ) {
			const statusClassName = 'post-relative-time-status__status ' + extraStatusClassName;

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
				{ post.sticky && this.getStickyLabel() }
				{ post.status === 'pending' && this.getPendingLabel() }
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
