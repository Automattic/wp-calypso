/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Rating = require( 'components/rating' );

export default React.createClass( {
	displayName: 'Rating',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<Rating rating={ 65 } size={ 50 } />
		);
	}
} );
