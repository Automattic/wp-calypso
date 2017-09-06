/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import { urlToDomainAndPath } from 'lib/url';
import { getSite } from 'state/sites/selectors';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { gmtOffset, timezone } from 'lib/site/utils';

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
		commentUrl: PropTypes.string,
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

	getFormattedDate = () => convertDateToUserLocation(
		( this.props.commentDate || new Date() ),
		timezone( this.props.site ),
		gmtOffset( this.props.site )
	).format( 'll LT' );

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
									<Emojify>
										{ authorDisplayName }
									</Emojify>
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
			commentUrl,
			showAuthorInfo,
			translate,
		} = this.props;
		const { isExpanded } = this.state;

		const classes = classNames( 'comment-detail__author', {
			'is-expanded': isExpanded,
		} );

		return (
			<div className={ classes }>
				<div className="comment-detail__author-preview">
					<Gravatar user={ this.getAuthorObject() } />
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-info-element comment-detail__author-name">
							<strong>
								<Emojify>
									{ authorDisplayName }
								</Emojify>
							</strong>
							<ExternalLink href={ authorUrl }>
								{ urlToDomainAndPath( authorUrl ) }
							</ExternalLink>
						</div>
						<ExternalLink
							className="comment-detail__author-info-element comment-detail__comment-date"
							href={ commentUrl }
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

const mapStateToProps = ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
} );

export default connect( mapStateToProps )( localize( CommentDetailAuthor ) );
