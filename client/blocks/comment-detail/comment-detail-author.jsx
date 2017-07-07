/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import QuerySiteSettings from 'components/data/query-site-settings';
import { urlToDomainAndPath } from 'lib/url';
import {
	defaultDateFormats,
	defaultTimeFormats,
} from 'my-sites/site-settings/date-time-format/default-formats';
import { phpToMomentDatetimeFormat } from 'my-sites/site-settings/date-time-format/utils';
import { getSiteSettings } from 'state/site-settings/selectors';

export class CommentDetailAuthor extends Component {
	static propTypes = {
		authorAvatarUrl: PropTypes.string,
		authorDisplayName: PropTypes.string,
		authorEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		authorId: PropTypes.number,
		authorIp: PropTypes.string,
		authorUrl: PropTypes.string,
		authorUsername: PropTypes.string,
		blockUser: PropTypes.func,
		commentDate: PropTypes.string,
		commentStatus: PropTypes.string,
		postUrl: PropTypes.string,
		showAuthorInfo: PropTypes.bool,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		showAuthorInfo: false,
	};

	state = {
		isExpanded: false,
	};

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	};

	getAuthorObject = () => ( {
		avatar_URL: this.props.authorAvatarUrl,
		display_name: this.props.authorDisplayName,
	} );

	getFormattedDate = () => {
		const {
			commentDate,
			dateFormat,
			moment,
			timeFormat,
			translate,
		} = this.props;

		const momentDate = moment( commentDate );

		if ( ! dateFormat || ! timeFormat ) {
			return phpToMomentDatetimeFormat(
				momentDate,
				defaultDateFormats[ 0 ] + ' ' + defaultTimeFormats[ 0 ]
			);
		}

		const date = phpToMomentDatetimeFormat( momentDate, dateFormat );
		const time = phpToMomentDatetimeFormat( momentDate, timeFormat );

		return translate( '%(date)s at %(time)s', {
			args: { date, time }
		} );
	}

	authorMoreInfo() {
		if ( ! this.props.showAuthorInfo ) {
			return null;
		}

		const {
			authorDisplayName,
			authorEmail,
			authorIp,
			authorIsBlocked,
			authorUrl,
			authorUsername,
			blockUser,
			translate,
		} = this.props;
		return (
			<div className="comment-detail__author-more-info">
				<div className="comment-detail__author-more-actions">
					<div className="comment-detail__author-more-element comment-detail__author-more-element-author">
						<Gravatar user={ this.getAuthorObject() } />
						<div className="comment-detail__author-info">
							<div className="comment-detail__author-name">
								<strong>
									{ authorDisplayName }
								</strong>
							</div>
							<div className="comment-detail__author-username">
								{ authorUsername }
							</div>
						</div>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="mail" />
						<span>
							{ authorEmail }
						</span>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="link" />
						<ExternalLink href={ authorUrl }>
							{ urlToDomainAndPath( authorUrl ) }
						</ExternalLink>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="globe" />
						<span>
							{ authorIp }
						</span>
					</div>
				</div>
				<div className="comment-detail__author-more-actions">
					<a
						className={ classNames(
							'comment-detail__author-more-element comment-detail__author-more-element-block-user',
							{ 'is-blocked': authorIsBlocked }
						) }
						onClick={ blockUser }
					>
						<Gridicon icon="block" />
						<span>{ authorIsBlocked
							? translate( 'Unblock user' )
							: translate( 'Block user' )
						}</span>
					</a>
				</div>
			</div>
		);
	}

	render() {
		const {
			authorDisplayName,
			authorUrl,
			commentStatus,
			postUrl,
			showAuthorInfo,
			siteId,
			translate,
		} = this.props;
		const { isExpanded } = this.state;

		const classes = classNames( 'comment-detail__author', {
			'is-expanded': isExpanded,
		} );

		return (
			<div className={ classes }>
				<QuerySiteSettings siteId={ siteId } />

				<div className="comment-detail__author-preview">
					<Gravatar user={ this.getAuthorObject() } />
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-info-element comment-detail__author-name">
							<strong>
								{ authorDisplayName }
							</strong>
							<ExternalLink href={ authorUrl }>
								{ urlToDomainAndPath( authorUrl ) }
							</ExternalLink>
						</div>
						<ExternalLink
							className="comment-detail__author-info-element comment-detail__comment-date"
							href={ postUrl }
						>
							{ this.getFormattedDate() }
						</ExternalLink>
					</div>
					{ 'unapproved' === commentStatus &&
						<div className="comment-detail__status-label is-unapproved">
							{ translate( 'Pending' ) }
						</div>
					}
					{
						showAuthorInfo &&
						<a className="comment-detail__author-more-info-toggle" onClick={ this.toggleExpanded }>
							<Gridicon icon="info-outline" />
						</a>
					}
				</div>
				{ this.authorMoreInfo() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const settings = getSiteSettings( state, ownProps.siteId );
	return {
		dateFormat: get( settings, 'date_format' ),
		timeFormat: get( settings, 'time_format' ),
	};
};

export default connect( mapStateToProps )( localize( CommentDetailAuthor ) );
