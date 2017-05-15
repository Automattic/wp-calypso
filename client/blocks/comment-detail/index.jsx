/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentDetailComment from './comment-detail-comment';
import CommentDetailHeader from './comment-detail-header';
import CommentDetailPost from './comment-detail-post';

export class CommentDetail extends Component {
	static propTypes = {
		author: PropTypes.object,
		comment: PropTypes.object,
		post: PropTypes.object,
	};

	state = {
		isExpanded: true,
	};

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	}

	render() {
		const {
			comment,
			post,
		} = this.props;
		const { isExpanded } = this.state;

		const classes = classNames( 'comment-detail', {
			'is-expanded': isExpanded,
		} );

		return (
			<Card is-compact className={ classes }>
				<CommentDetailHeader
					author={ comment.author }
					commentBody={ comment.body }
					isExpanded={ isExpanded }
					toggleExpanded={ this.toggleExpanded }
				/>
				{ isExpanded &&
					<div className="comment-detail__content">
						<CommentDetailPost
							author={ post.author }
							siteIcon={ post.site.icon }
							title={ post.title }
							url={ post.url }
						/>
						<CommentDetailComment comment={ comment } />
					</div>
				}
			</Card>
		);
	}
}

export default CommentDetail;
