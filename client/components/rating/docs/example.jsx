/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Rating = require( 'components/rating' );

module.exports = React.createClass( {
	displayName: 'Rating',

	mixins: [ React.addons.PureRenderMixin ],

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
