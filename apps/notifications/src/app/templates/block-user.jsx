/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	getRelativeTimeString,
	getShortDateString,
	getNumericDateString,
	getISODateString,
} from '@automattic/i18n-utils';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import getIsNoteApproved from '../state/selectors/get-is-note-approved';
import FollowLink from './follow-link';
import { linkProps } from './functions';

const aSecond = 1000;
const aMinute = aSecond * 60;
const anHour = aMinute * 60;
const aDay = anHour * 24;

function getDisplayURL( url ) {
	const parser = document.createElement( 'a' );
	parser.href = url;
	return ( parser.hostname + parser.pathname ).replace( /\/$/, '' );
}

export class UserBlock extends Component {
	/**
	 * Format a timestamp for showing how long ago an event occurred.
	 * Specifically here for showing when a comment was made.
	 *
	 * If within the past five days, a relative time
	 * e.g. "23 sec. ago", "15 min. ago", "4 hrs. ago", "1 day ago"
	 *
	 * If older than five days, absolute date
	 * e.g. "30 Apr 2015"
	 *
	 * If anything goes wrong, ISO date
	 * e.g. "2020-12-20"
	 * Localized dates are always better, but ISO dates should be broadly recognizable.
	 * @param {string} timestamp - Timestamp in Date.parse()'able format
	 * @returns {string} - Timestamp formatted for display or '' if input invalid
	 */
	getTimeString = ( timestamp ) => {
		const MAX_LENGTH = 15;
		const parsedTime = Date.parse( timestamp );
		let timeString;

		if ( isNaN( parsedTime ) ) {
			return '';
		}

		const localeSlug = getLocaleSlug();

		timeString = getShortDateString( parsedTime, localeSlug );

		// If the localized short date format is too long, use numeric one.
		if ( timeString.length > MAX_LENGTH ) {
			timeString = getNumericDateString( parsedTime, localeSlug );
		}

		// If the localized numeric date format is still too long, use ISO one.
		if ( timeString.length > MAX_LENGTH ) {
			timeString = getISODateString( parsedTime );
		}

		// Use relative time strings (e.g. '2 min. ago') for recent dates.
		if ( Date.now() - parsedTime < 5 * aDay ) {
			const relativeTimeString = getRelativeTimeString( {
				timestamp: parsedTime,
				locale: localeSlug,
			} );

			// Only use relative date if it makes sense and is not too long.
			if ( relativeTimeString && relativeTimeString.length <= MAX_LENGTH ) {
				timeString = relativeTimeString;
			}
		}

		return timeString;
	};

	render() {
		const grav = this.props.block.media[ 0 ];
		let home_url = '';
		let home_title = '';
		let timeIndicator;
		let homeTemplate;
		let followLink;

		if ( this.props.block.meta ) {
			if ( this.props.block.meta.links ) {
				home_url = this.props.block.meta.links.home || '';
			}
			if ( this.props.block.meta.titles ) {
				home_title = this.props.block.meta.titles.home || '';
			}
		}
		if ( ! home_title && home_url ) {
			home_title = getDisplayURL( home_url );
		}

		if ( 'comment' === this.props.note.type ) {
			// if comment is not approved, show the user's url instead of site
			// title so it's easier to tell if they are a spammer
			if ( ! this.props.isApproved && home_url ) {
				home_title = getDisplayURL( home_url );
			}

			timeIndicator = (
				<span className="wpnc__user__timeIndicator">
					<a
						href={ this.props.note.url }
						target="_blank"
						rel="noopener noreferrer"
						{ ...linkProps( this.props.note ) }
					>
						{ this.getTimeString( this.props.note.timestamp ) }
					</a>
					<span className="wpnc__user__bullet" />
				</span>
			);
		} else {
			timeIndicator = '';
		}

		if ( home_title ) {
			const homeClassName =
				timeIndicator !== '' ? 'wpnc__user__meta wpnc__user__bulleted' : 'wpnc__user__meta';
			homeTemplate = (
				<div className={ homeClassName }>
					<span className="wpnc__user__ago">{ timeIndicator }</span>
					<a
						className="wpnc__user__site"
						href={ home_url }
						target="_blank"
						rel="noopener noreferrer"
						{ ...linkProps( this.props.note, this.props.block ) }
					>
						{ home_title }
					</a>
				</div>
			);
		} else {
			homeTemplate = (
				<div className="wpnc__user__meta">
					<span className="wpnc__user__ago">{ timeIndicator }</span>
				</div>
			);
		}

		if (
			this.props.block.actions &&
			this.props.block.meta.ids.site !== undefined &&
			this.props.block.meta.ids.site !== 'undefined'
		) {
			followLink = (
				<FollowLink
					site={ this.props.block.meta.ids.site }
					isFollowing={ this.props.block.actions.follow }
					noteType={ this.props.note.type }
				/>
			);
		}

		const userId = this.props.block?.meta?.ids?.user;
		const readerProfileUrl = userId
			? `https://wordpress.com/reader/users/id/${ userId }`
			: home_url;

		if ( home_url ) {
			return (
				<div className="wpnc__user">
					<a
						className="wpnc__user__site"
						href={ readerProfileUrl }
						target="_blank"
						rel="noreferrer"
					>
						<img src={ grav.url } height={ grav.height } width={ grav.width } alt="Avatar" />
					</a>
					<div>
						<span className="wpnc__user__username">
							<a
								className="wpnc__user__home"
								href={ readerProfileUrl }
								target="_blank"
								rel="noreferrer"
							>
								{ this.props.block.text }
							</a>
						</span>
					</div>
					{ homeTemplate }
					{ followLink }
				</div>
			);
		}
		return (
			<div className="wpnc__user">
				<img src={ grav.url } height={ grav.height } width={ grav.width } alt="Avatar" />
				<span className="wpnc__user__username">{ this.props.block.text }</span>
				{ homeTemplate }
				{ followLink }
			</div>
		);
	}
}

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
} );

export default connect( mapStateToProps )( localize( UserBlock ) );
