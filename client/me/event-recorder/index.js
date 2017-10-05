/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

module.exports = {
	recordEvent: function( eventAction ) {
		analytics.ga.recordEvent( 'Me', eventAction );
	},

	recordEventClosure: function( eventAction, callback ) {
		return function( event ) {
			analytics.ga.recordEvent( 'Me', eventAction );

			if ( callback ) {
				callback( event );
			}
		};
	},

	recordClickEvent: function( eventAction, callback ) {
		return function( event ) {
			analytics.ga.recordEvent( 'Me', 'Clicked on ' + eventAction );

			if ( callback ) {
				callback( event );
			}
		};
	},

	recordFocusEvent: function( eventAction, callback ) {
		return function( event ) {
			analytics.ga.recordEvent( 'Me', 'Focused on ' + eventAction );

			if ( callback ) {
				callback( event );
			}
		};
	},

	recordCheckboxEvent: function( checkboxName, callback ) {
		return function( event ) {
			var eventAction = 'Clicked ' + checkboxName + ' checkbox',
				optionValue = event.target.checked ? 1 : 0;

			analytics.ga.recordEvent( 'Me', eventAction, 'checked', optionValue );

			if ( callback ) {
				callback( event );
			}
		};
	},

	recordRadioEvent: function( radioName, callback ) {
		return function( event ) {
			var eventAction = 'Clicked ' + radioName + ' radio';

			analytics.ga.recordEvent( 'Me', eventAction, 'checked', event.target.value );

			if ( callback ) {
				callback( event );
			}
		};
	}
};
