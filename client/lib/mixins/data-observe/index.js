/** @format */
var debug = require( 'debug' )( 'calypso:data-observe' );

module.exports = function() {
	var propNames = Array.prototype.slice.call( arguments );

	return {
		componentDidMount: function() {
			propNames.forEach( function( propName ) {
				if ( this.props[ propName ] ) {
					this.props[ propName ].on( 'change', this.update );
				} else {
					debug( propName + ' is not set.' );
				}
			}, this );
		},

		componentWillUnmount: function() {
			propNames.forEach( function( propName ) {
				if ( this.props[ propName ] ) {
					this.props[ propName ].off( 'change', this.update );
				}
			}, this );
		},

		componentWillReceiveProps: function( nextProps ) {
			propNames.forEach( function( propName ) {
				if ( this.props[ propName ] !== nextProps[ propName ] ) {
					// unbind the change event from the existing property instance
					if ( this.props[ propName ] ) {
						this.props[ propName ].off( 'change', this.update );
					}

					// bind the change event for the next property instance
					if ( nextProps[ propName ] ) {
						nextProps[ propName ].on( 'change', this.update );
					}
				}
			}, this );
		},

		update: function() {
			if ( this.isMounted() ) {
				debug( 'Re-rendering ' + this.constructor.displayName + ' component.' );
				this.forceUpdate();
			}
		},
	};
};
