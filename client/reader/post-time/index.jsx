/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calyso:reader:post-time' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
const smartSetState = require( 'lib/react-smart-set-state' ),
	ticker = require( 'lib/ticker' ),
	humanDate = require( 'lib/human-date' );

var PostTime = React.createClass( {

	mixins: [ PureRenderMixin ],

	componentWillMount: function() {
		this._update();
	},

	componentDidMount: function() {
		debug( 'listening for ticks' );
		ticker.on( 'tick', this._update );
	},

	componentWillReceiveProps: function( nextProps ) {
		this._update( nextProps.date );
	},

	componentWillUnmount: function() {
		ticker.off( 'tick', this._update );
	},

	smartSetState: smartSetState,

	_update: function( date ) {
		date = date || this.props.date;
		this.smartSetState( { ago: humanDate( date ) } );
	},

	render: function() {
		var date = this.props.date;
		return (
			<time className={ this.props.className } dateTime={ date } title={ this.moment( date ).format( 'llll' ) } >
				{ this.state.ago }
			</time>
		);
	}

} );

module.exports = PostTime;
