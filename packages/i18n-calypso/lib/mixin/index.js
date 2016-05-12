var i18n = require( '..' ),
	moment = require( 'moment-timezone' ),
	tzDetect = require( './timezone' ),
	debug = require( 'debug' )( 'i18n-calypso:mixin' );

var i18nStateObserver = i18n.stateObserver,
	componentUpdateHooks = i18n.componentUpdateHooks;

module.exports = {
	moment: moment,

	numberFormat: i18n.numberFormat.bind( i18n ),

	translate: i18n.translate.bind( i18n ),

	componentWillMount: function() {
		moment.tz.setDefault( tzDetect() );
	},

	componentDidMount: function() {
		i18nStateObserver.on( 'change', this.updateTranslation );
		componentUpdateHooks.forEach( function( hook ) {
			hook();
		} );
	},

	componentDidUpdate: function() {
		componentUpdateHooks.forEach( function( hook ) {
			hook();
		} );
	},

	componentWillUnmount: function() {
		i18nStateObserver.off( 'change', this.updateTranslation );
	},

	updateTranslation: function() {
		debug( 'Re-rendering ' + this.constructor.displayName + ' component.' );
		if ( this.isMounted() ) {
			this.forceUpdate();
		}
	}
};