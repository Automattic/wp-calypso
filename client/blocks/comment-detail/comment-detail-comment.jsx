/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CommentDetailAuthor from './comment-detail-author';
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import { getSiteComment } from 'state/selectors';

export class CommentDetailComment extends Component {
	static propTypes = {
		commentContent: PropTypes.string,
		commentId: PropTypes.number,
		siteId: PropTypes.number,
	};

	render() {
		const {
			commentContent,
			commentId,
			repliedToComment,
			siteId,
			translate,
		} = this.props;

		return (
			<div className="comment-detail__comment">
				<div className="comment-detail__comment-content">
					<CommentDetailAuthor commentId={ commentId } siteId={ siteId } />
					<AutoDirection>
						<Emojify>
							<div
								className="comment-detail__comment-body"
								dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
							/>
						</Emojify>
					</AutoDirection>

					{ repliedToComment && (
						<div className="comment-detail__comment-reply">
							<a>
								<Gridicon icon="reply" />
								<span>{ translate( 'You replied to this comment' ) }</span>
							</a>
						</div>
					) }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId, siteId } ) => ( {
	commentContent: get( getSiteComment( state, siteId, commentId ), 'content' ),
	repliedToComment: false, // TODO: not available in the current data structure
} );

export default connect( mapStateToProps )( localize( CommentDetailComment ) );
