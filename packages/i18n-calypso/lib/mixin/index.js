var tzDetect = require( './timezone' ),
	debug = require( 'debug' )( 'i18n-calypso:mixin' );

module.exports = function( i18n ) {
	return {
		moment: i18n.moment,

		numberFormat: i18n.numberFormat.bind( i18n ),

		translate: i18n.translate.bind( i18n ),

		componentWillMount: function() {
			i18n.moment.tz.setDefault( tzDetect() );
		},

		componentDidMount: function() {
			i18n.stateObserver.addListener( 'change', this.updateTranslation );
			i18n.componentUpdateHooks.forEach( function( hook ) {
				hook();
			} );
		},

		componentDidUpdate: function() {
			i18n.componentUpdateHooks.forEach( function( hook ) {
				hook();
			} );
		},

		componentWillUnmount: function() {
			i18n.stateObserver.removeListener( 'change', this.updateTranslation );
		},

		updateTranslation: function() {
			debug( 'Re-rendering ' + this.constructor.displayName + ' component.' );
			if ( this.isMounted() ) {
				this.forceUpdate();
			}
		}
	};
};