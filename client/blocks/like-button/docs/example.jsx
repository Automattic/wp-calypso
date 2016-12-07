/**
* External dependencies
*/
import React, { PropTypes, PureComponent } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import LikeButton from 'blocks/like-button/button';
import Card from 'components/card/compact';

const SimpleLikeButtonContainer = React.createClass( {

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return {
			liked: !! this.props.liked,
			count: this.props.likeCount || 0
		};
	},

	render() {
		return (
			<LikeButton { ...this.props }
				onLikeToggle={ this.handleLikeToggle }
				likeCount={ this.state.count }
				liked={ this.state.liked }
			/> );
	},

	handleLikeToggle( newState ) {
		this.setState( {
			liked: newState,
			count: this.state.count += ( newState ? 1 : -1 )
		} );
	}
} );

const LikeButtons = React.createClass( {
	displayName: 'LikeButton',

	mixins: [ PureRenderMixin ],

	defaultProps: {
		tagName: 'a',
		likeCount: 0,
		isShowingOff: false
	},

	render() {
		if (this.props.isShowingOff) {
			return (
				<div>
					<Card compact>
						<SimpleLikeButtonContainer { ...this.props } />
					</Card>
				</div>
			);
		}

		return (
			<div>
				<Card compact>
					<SimpleLikeButtonContainer tagName="a" likeCount={ 0 } { ...this.props } />
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
} );

export default LikeButtons;
