/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

var ReadingTime = React.createClass( {

	mixins: [ PureRenderMixin ],

	render: function() {
		var words = this.props.words || 0,
			timeInMinutes = Math.round( this.props.readingTime / 60 ),
			approxTime = null,
			readingTime;

		if ( timeInMinutes > 1 ) {
			approxTime = ( <span className="reading-time__approx">( { this.translate( '~%d min', {
				args: [ timeInMinutes ],
				context: 'An approximate time to read something, in minutes'
			} ) })</span> );
		}

		readingTime = this.translate(
			'%d word {{Time/}}',
			'%d words {{Time/}}', {
				count: words,
				args: [ words ],
				components: { Time: approxTime }
			} );

		return (
			<span className="byline__reading-time reading-time">{ readingTime }</span>
			);
	}

} );

module.exports = ReadingTime;
