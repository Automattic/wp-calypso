/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:stats:mixin-skeleton' );

module.exports = function( dataFn ) {

	return {
		
		getInitialState: function() {
			// if we have existing data, do not show loading skeleton
			var loading = this[ dataFn ].call() ? false : true;
			return {
				loading: loading
			};
		},

		componentWillReceiveProps: function( nextProps ) {
			var data = this[ dataFn ].call( nextProps );

			debug( 'skeleton found data', data );

			this.setState( {
				loading: ! data
			} );
		}

	};

};
