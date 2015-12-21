/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Rating = require( 'components/rating' );

module.exports = React.createClass( {
	displayName: 'Rating',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/rating">Rating</a>
				</h2>

				<Rating rating={ 65 } size={ 50 } />
			</div>
		);
	}
} );
