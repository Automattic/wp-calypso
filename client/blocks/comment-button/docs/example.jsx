/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CommentButton from 'blocks/comment-button';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'CommentButtonExample',

	propTypes: {
		isShowingOff: PropTypes.bool
	},

	getDefaultProps() {
		return {
			isShowingOff: false
		};
	},

	render() {
		if ( this.props.isShowingOff ) {
			return (
				<div>
					<Card compact>
						<CommentButton { ...this.props } />
					</Card>
				</div>
			);
		}

		return (
			<div>
				<Card compact>
					<CommentButton commentCount={ 0 } />
				</Card>
				<Card compact>
					<CommentButton commentCount={ 42 } />
				</Card>
			</div>
		);
	}
} );
