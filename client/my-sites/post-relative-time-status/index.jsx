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

	getDisplayedTimeForLabel() {
		const moment = this.props.moment;
		const now = moment();
		const timestamp = moment( this.getTimestamp() );

		const isScheduledPost = this.props.post.status === 'future';

		let displayedTime;
		if ( isScheduledPost ) {
			displayedTime = timestamp.calendar( null, {
				nextDay: this.props.translate( '[tomorrow at] LT', {
					comment: 'LT refers to time (eg. 18:00)',
				} ),
				sameElse: this.props.translate( 'll [at] LT', {
					comment:
						'll refers to date (eg. 21 Apr) for when the post will be published & LT refers to time (eg. 18:00) - "at" is translated',
				} ),
			} );
		} else {
			if ( Math.abs( now.diff( this.getTimestamp(), 'days' ) ) < 7 ) {
				return timestamp.fromNow();
			}

			const sameElse = this.props.translate( 'll [at] LT', {
				comment:
					'll refers to date (eg. 21 Apr) & LT refers to time (eg. 18:00) - "at" is translated',
			} );

			displayedTime = timestamp.calendar( null, {
				sameElse,
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
							{ this.getDisplayedTimeForLabel() }
						</time>
					</>
				) }
			</span>
		);
	}

	getStatusText() {
		const status = this.props.post.status;
		const args = {
			displayedTime: this.getDisplayedTimeForLabel(),
		};
		const moment = this.props.moment;
		const now = moment();
		const displayOn = Math.abs( now.diff( this.getTimestamp(), 'days' ) ) >= 7;

		switch ( status ) {
			case 'trash':
				if ( displayOn ) {
					return this.props.translate( 'trashed on %(displayedTime)s', {
						comment:
							'%(displayedTime)s is the absolute date (ie. Apr 21, at 10:07 PM) when a post or page was trashed',
						args,
					} );
				}
				return this.props.translate( 'trashed %(displayedTime)s', {
					comment:
						'%(displayedTime)s is the relative date (ie. 3 days ago) when a post or page was trashed',
					args,
				} );

			case 'future':
				return this.props.translate( 'scheduled for %(displayedTime)s', {
					comment:
						'%(displayedTime)s is when a scheduled post or page is set to be published. It can be either "tomorrow at 16H", or an absoltute date (ie. Apr 21, at 10:07 PM)',
					args,
				} );

			case 'draft':
			case 'pending':
				if ( displayOn ) {
					return this.props.translate( 'draft last modified on %(displayedTime)s', {
						comment:
							'%(displayedTime)s is the absolute date (ie. Apr 21, at 10:07 PM) when a draft post or page was last modified',
						args,
					} );
				}

				return this.props.translate( 'draft last modified %(displayedTime)s', {
					comment:
						'%(displayedTime)s is the relative date (ie. 3 days ago) when a draft post or page was last modified',
					args,
				} );

			case 'private':
			case 'publish':
				if ( displayOn ) {
					return this.props.translate( 'published on %(displayedTime)s', {
						comment:
							'%(displayedTime)s is the absolute date (ie. Apr 21, at 10:07 PM ) when a post or page was published',
						args,
					} );
				}

				return this.props.translate( 'published %(displayedTime)s', {
					comment:
						'%(displayedTime)s is the relative date (ie. 3 days ago) when a post or page was published',
					args,
				} );
		}
	}

	/**
	 * Get status label
	 */
	getStatus() {
		const status = this.props.post.status;
		let extraStatusClassName;
		let statusIcon;
		let statusText = this.getStatusText();

		if ( status === 'trash' ) {
			extraStatusClassName = 'is-trash';
			statusIcon = 'trash';
		} else if ( status === 'future' ) {
			extraStatusClassName = 'is-scheduled';
			statusIcon = 'calendar';
		} else if ( status === 'new' ) {
			statusText = this.props.translate( 'Publish immediately' );
		}

		return this.getLabel( statusText, extraStatusClassName, statusIcon );
	}

	/**
	 * Get "private" label
	 */
	getPrivateLabel() {
		return this.getLabel( this.props.translate( 'private' ), 'is-private' );
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
				{ showPublishedStatus ? this.getStatus() : timeText }
				{ post.status === 'pending' && this.getPendingLabel() }
				{ post.status === 'private' && this.getPrivateLabel() }
				{ post.sticky && this.getStickyLabel() }
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
