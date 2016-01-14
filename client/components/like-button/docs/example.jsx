/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var LikeButton = require( 'components/like-button/button' ),
	Card = require( 'components/card/compact' );

var SimpleLikeButtonContainer = React.createClass( {

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			liked: !! this.props.liked,
			count: this.props.likeCount || 0
		};
	},

	render: function() {
		return (
			<LikeButton { ...this.props }
				onLikeToggle={ this.handleLikeToggle }
				likeCount={ this.state.count }
				liked={this.state.liked }
			/> );
	},

	handleLikeToggle: function( newState ) {
		this.setState( {
			liked: newState,
			count: this.state.count += ( newState ? 1 : -1 )
		} );
	}
} );

var LikeButtons = React.createClass( {
	displayName: 'LikeButton',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/like-button">Like button</a>
				</h2>
				<Card>
					<span>Default:</span>
					<SimpleLikeButtonContainer tagName="button" likeCount={ 12 } />
				</Card>
				<Card>
					<span>Counter shown by default:</span>
					<SimpleLikeButtonContainer tagName="button" likeCount={ 12 } showCount={ true } />
				</Card>
				<Card>
					<span>Liked button:</span>
					<SimpleLikeButtonContainer tagName="button" likeCount={ 12 } liked={ true } />
				</Card>
			</div>
		);
	}
} );

module.exports = LikeButtons;
