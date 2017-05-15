/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

export class CommentDetailAuthor extends Component {
	static propTypes = {
		author: PropTypes.object,
		commentDate: PropTypes.string,
	};

	state = {
		isExpanded: false,
	};

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	}

	render() {
		const {
			author,
			commentDate,
			moment,
			translate,
		} = this.props;
		const { isExpanded } = this.state;

		const classes = classNames( 'comment-detail__author', {
			'is-expanded': isExpanded,
		} );

		return (
			<div className={ classes }>
				<div className="comment-detail__author-preview">
					<div className="comment-detail__author-avatar">
						<img src={ author.avatar_URL } />
					</div>
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-name">
							<strong>
								{ author.name }
							</strong>
							<span>
								{ author.URL }
							</span>
						</div>
						<div className="comment-detail__comment-date">
							{ moment( commentDate ).format( 'MMMM D, YYYY H:mma' ) }
						</div>
					</div>
					<a className="comment-detail__author-more-info-toggle" onClick={ this.toggleExpanded }>
						<Gridicon icon="info-outline" />
					</a>
				</div>

				<div className="comment-detail__author-more-info">
					<div className="comment-detail__author-more-actions">
						<div className="comment-detail__author-more-element comment-detail__author-more-element-author">
							<div className="comment-detail__author-avatar">
								<img src={ author.avatar_URL } />
							</div>
							<div className="comment-detail__author-info">
								<div className="comment-detail__author-name">
									<strong>
										{ author.name }
									</strong>
								</div>
								<div className="comment-detail__author-username">
									{ author.username }
								</div>
							</div>
						</div>
						<div className="comment-detail__author-more-element">
							<Gridicon icon="mail" />
							<span>
								{ author.email }
							</span>
						</div>
						<div className="comment-detail__author-more-element">
							<Gridicon icon="link" />
							<span>
								{ author.URL }
							</span>
						</div>
						<div className="comment-detail__author-more-element">
							<Gridicon icon="globe" />
							<span>
								{ author.ip }
							</span>
						</div>
					</div>
					<div className="comment-detail__author-more-actions">
						<a className="comment-detail__author-more-element">
							<Gridicon icon="comment" />
							<span>{ translate( 'View all comments' ) }</span>
						</a>
						<a className="comment-detail__author-more-element">
							<Gridicon icon="block" />
							<span>{ translate( 'Block user' ) }</span>
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( CommentDetailAuthor );
