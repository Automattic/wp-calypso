/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import { getPostTotalCommentsCount } from 'state/comments/selectors';

const CommentCount = ( { commentCount } ) => <span className="comment-button__label-count">{ commentCount }</span>

const CommentButton = React.createClass( {

	propTypes: {
		onClick: React.PropTypes.func,
		tagName: React.PropTypes.string,
		commentCount: React.PropTypes.number,
		showLabel: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			onClick: noop,
			tagName: 'li',
			size: 24,
			commentCount: 0,
			showLabel: true
		};
	},

	render() {
		const {
			translate,
			commentCount,
			onClick,
			showLabel,
			tagName: containerTag,
		} = this.props;

		let label;
		if ( commentCount === 0 ) {
			label = <span className="comment-button__label-status">
				{ translate( 'Comment', { context: 'verb' } ) }
			</span>;
		} else {
			label = translate(
				'{{count/}}{{span}}Comment{{/span}}',
				'{{count/}}{{span}}Comments{{/span}}', {
					components: {
						count: <CommentCount { ...{ commentCount } }/>,
						span: <span className="comment-button__label-status" />
					},
					count: commentCount,
				}
			);
		}

		// If the label is to be shown, output the label from above,
		// otherwise just show the count if it's > 0.
		const labelElement = ( <span className="comment-button__label">
			{ showLabel ? label : commentCount > 0 && <CommentCount { ...{ commentCount } }/> }
		</span> );

		return React.createElement(
			containerTag, {
				className: 'comment-button',
				onClick
			},
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />, labelElement
		);
	}
} );

const mapStateToProps = ( state, ownProps ) => {
	const {
		post: {
			site_ID: siteId,
			ID: postId,
		},
		commentCount,
	} = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount
	};
};

export default connect( mapStateToProps )( localize( CommentButton ) );
