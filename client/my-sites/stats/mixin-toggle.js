/**
 * External dependencies
 */
var store = require( 'store' ),
	debug = require( 'debug' )( 'calypso:stats:mixin-toggle' );


/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	titlecase = require( 'to-title-case' );

module.exports = function() {
	var localValue = Array.prototype.slice.call( arguments ).pop();

	return {

		getInitialState: function() {
			if ( this.props.site ) {
				var localKey = 'statsHide' + this.props.site.ID,
					hiddenSiteModules = store.get( localKey ) || [],
					localStorageValue = this.props.path || localValue;

				return {
					showModule: ( hiddenSiteModules.indexOf( localStorageValue ) < 0 || this.props.summary ) && ! this.props.defaultClosed
				};
			} else {
				// If we are missing a site, default to show modules
				return {
					showModule: ! this.props.defaultClosed,
					showInfo: false
				};

			}
		},

		// Handles the toggling of the info box
		toggleInfo: function( event ) {
			event.stopPropagation();
			event.preventDefault();
			var gaEvent = this.state.showInfo ? 'Closed' : 'Opened';

			if ( this.props.path ) {
				analytics.ga.recordEvent( 'Stats', gaEvent + ' More Information Panel', titlecase( this.props.path ) );
			}

			this.setState( {
				showInfo: ! this.state.showInfo,
				showModule: this.state.showModule
			} );
		},

		toggleModule: function( event ) {
			event.preventDefault();
			var localKey = 'statsHide' + this.props.site.ID,
				localStorageValue = this.props.path || localValue,
				hiddenSiteModules = store.get( localKey ) || [],
				showInfo = this.state.showInfo,
				gaEvent = this.state.showModule ? 'Collapsed' : 'Expanded',
				newState;

				newState = {
					showModule: ! this.state.showModule,
					showInfo: showInfo
				};

			analytics.ga.recordEvent( 'Stats', gaEvent + ' Module', titlecase( this.props.path ) );


			if( this.props.summary ) {
				return true;
			} else {
				if( this.state.showModule ) {
					// hide module, add to hidden LS
					hiddenSiteModules.push( localStorageValue );
				} else {
					hiddenSiteModules = hiddenSiteModules.filter( function( displayName ) {
						return localStorageValue !== displayName;
					}, this );
				}
				// Persist to Local Storage
				debug('hiddensitemodules', hiddenSiteModules);
				store.set( localKey, hiddenSiteModules );
				this.setState( newState );
			}
		}

	};

};
