/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import DocsExample from'components/docs-example';
import LikeButton from 'components/like-button/button';

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
				liked={ this.state.liked }
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
			<DocsExample
				title="Like button"
				url="/devdocs/design/like-button"
				componentUsageStats={ this.props.getUsageStats( LikeButton ) }
			>
				<Card compact>
					<SimpleLikeButtonContainer tagName="button" likeCount={ 0 } />
				</Card>
				<Card compact>
					<SimpleLikeButtonContainer tagName="button" likeCount={ 12 } />
				</Card>
				<Card compact>
					<SimpleLikeButtonContainer tagName="button" likeCount={ 12 } liked={ true } />
				</Card>
			</DocsExample>
		);
	}
} );

module.exports = LikeButtons;
