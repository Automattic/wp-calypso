/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import LikeButton from 'blocks/like-button/button';
import { CompactCard as Card } from '@automattic/components';

class SimpleLikeButtonContainer extends React.PureComponent {
	state = {
		liked: !! this.props.liked,
		count: this.props.likeCount || 0,
	};

	render() {
		return (
			<LikeButton
				{ ...this.props }
				onLikeToggle={ this.handleLikeToggle }
				likeCount={ this.state.count }
				liked={ this.state.liked }
			/>
		);
	}

	handleLikeToggle = ( newState ) => {
		this.setState( {
			liked: newState,
			count: ( this.state.count += newState ? 1 : -1 ),
		} );
	};
}

class LikeButtons extends React.PureComponent {
	static displayName = 'LikeButton';

	render() {
		return (
			<div>
				<Card compact>
					<SimpleLikeButtonContainer tagName="a" likeCount={ 0 } />
				</Card>
				<Card compact>
					<SimpleLikeButtonContainer tagName="a" likeCount={ 12 } />
				</Card>
				<Card compact>
					<SimpleLikeButtonContainer tagName="a" likeCount={ 12 } liked={ true } />
				</Card>
			</div>
		);
	}
}

export default LikeButtons;
