/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import getIsNoteApproved from '../state/selectors/get-is-note-approved';
import { linkProps } from './functions';
import FollowLink from './follow-link';

function getDisplayURL( url ) {
	var parser = document.createElement( 'a' );
	parser.href = url;
	return ( parser.hostname + parser.pathname ).replace( /\/$/, '' );
}

export class UserBlock extends React.Component {
	/**
	 * Format a timestamp for showing how long
	 * ago an event occurred. Specifically here
	 * for showing when a comment was made.
	 *
	 * If within the past five days, a relative time
	 *   e.g. "23 sec", "15 min", "4 hours", "1 day"
	 *
	 * If older than five days, absolute date
	 *   e.g. "30 Apr 2015"
	 *
	 * @param {string} timestamp - Time stamp in Date.parse()'able format
	 * @returns {string} - Time stamp formatted for display or '' if input invalid
	 */
	getTimeString = ( timestamp ) => {
		var DAY_IN_SECONDS = 3600 * 24,
			MAX_LENGTH = 15,
			parsedTime = Date.parse( timestamp ),
			momentTime,
			timeString;

		if ( isNaN( parsedTime ) ) {
			return '';
		}

		const localeSlug = getLocaleSlug();
		momentTime = moment( timestamp ).locale( localeSlug );

		if ( Date.now() - parsedTime > 1000 * DAY_IN_SECONDS * 5 ) {
			// 30 Apr 2015
			timeString = momentTime.format( 'll' );

			if ( timeString.length > MAX_LENGTH ) {
				// 2015/4/30 if 'll' is too long, e.g. "30 de abr. de 2015"
				timeString = momentTime.format( 'l' );
			}
		} else {
			// simplified units, no "ago", e.g. 7 min, 4 hours, 2 days
			timeString = momentTime.fromNow( true );
		}

		return timeString;
	};

	render() {
		var grav = this.props.block.media[ 0 ],
			home_url = '',
			home_title = '',
			timeIndicator,
			homeTemplate,
			followLink,
			noteActions;

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
			var homeClassName =
				timeIndicator != '' ? 'wpnc__user__meta wpnc__user__bulleted' : 'wpnc__user__meta';
			homeTemplate = (
				<p className={ homeClassName }>
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
				</p>
			);
		} else {
			homeTemplate = (
				<div className="wpnc__user__meta">
					<span className="wpnc__user__ago">{ timeIndicator }</span>
				</div>
			);
		}

		if ( this.props.block.actions && 'undefined' != this.props.block.meta.ids.site ) {
			followLink = (
				<FollowLink
					site={ this.props.block.meta.ids.site }
					isFollowing={ this.props.block.actions.follow }
					noteType={ this.props.note.type }
				/>
			);
		}

		if ( home_url ) {
			return (
				<div className="wpnc__user">
					<a className="wpnc__user__site" href={ home_url } target="_blank">
						<img src={ grav.url } height={ grav.height } width={ grav.width } />
					</a>
					<span className="wpnc__user__username">
						<a className="wpnc__user__home" href={ home_url } target="_blank">
							{ this.props.block.text }
						</a>
					</span>
					{ homeTemplate }
					{ followLink }
				</div>
			);
		} else {
			return (
				<div className="wpnc__user">
					<img src={ grav.url } height={ grav.height } width={ grav.width } />
					<span className="wpnc__user__username">{ this.props.block.text }</span>
					{ homeTemplate }
					{ followLink }
				</div>
			);
		}
	}
}

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
} );

export default connect( mapStateToProps )( localize( UserBlock ) );
