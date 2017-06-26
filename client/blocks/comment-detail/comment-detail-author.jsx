/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { urlToDomainAndPath } from 'lib/url';

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
		showAuthorInfo: PropTypes.bool,
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

	authorMoreInfo() {
		if ( ! this.props.showAuthorInfo ) {
			return null;
		}

		const {
			authorAvatarUrl,
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
						<img className="comment-detail__author-avatar" src={ authorAvatarUrl } />
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
						<span>
							{ authorUrl }
						</span>
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
			authorAvatarUrl,
			authorDisplayName,
			authorUrl,
			commentDate,
			commentStatus,
			moment,
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
					<img className="comment-detail__author-avatar" src={ authorAvatarUrl } />
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-info-element comment-detail__author-name">
							<strong>
								{ authorDisplayName }
							</strong>
							<span>
								{ urlToDomainAndPath( authorUrl ) }
							</span>
						</div>
						<div className="comment-detail__author-info-element comment-detail__comment-date">
							{ moment( commentDate ).format( 'MMMM D, YYYY H:mma' ) }
						</div>
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

export default localize( CommentDetailAuthor );
