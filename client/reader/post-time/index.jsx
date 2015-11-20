var debug = require( 'debug' )( 'calyso:reader:post-time' ),
	React = require( 'react/addons' ),
	ticker = require( 'lib/ticker' ),
	humanDate = require( 'lib/human-date' );

var PostTime = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

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

	_update: function( date ) {
		date = date || this.props.date;
		this.setState( { ago: humanDate( date ) } );
	},

	render: function() {
		var date = this.props.date;
		return (
			<time className={ this.props.className } dateTime={ date } title={ date } >
				{ this.state.ago }
			</time>
		);
	}

} );

module.exports = PostTime;
