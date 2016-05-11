
var i18n = require( '..' ),
	assign = require( 'lodash/assign' );

/**
 * Localize a React component
 * @param ComposedComponent
 * @returns {*}
 */
module.exports = function( ComposedComponent ) {
	// Warning: react is not a dependency (nor a peer dependency of this lib) but is required for this localize module.
	// Sot it will only work with npm v3 and if `react` is a dependency of your project
	var React = require( 'react' ),
		componentName = ComposedComponent.displayName || ComposedComponent.name || '';

	return React.createClass( {
		displayName: 'Localized' + componentName,

		componentDidMount: function() {
			this.boundForceUpdate = this.forceUpdate.bind( this );
			i18n.stateObserver.on( 'change', this.boundForceUpdate );
		},

		componentWillUnmount: function() {
			i18n.stateObserver.off( 'change', this.boundForceUpdate );
		},

		render: function() {
			var props = assign( {}, this.props, {
				moment: i18n.moment,
				numberFormat: i18n.numberFormat,
				translate: i18n.translate
			} );
			return React.createElement( ComposedComponent, props );
		}
	} );
};
