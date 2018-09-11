let React = require( 'react' ),
	assign = require( 'lodash.assign' ),
	createClass = require( 'create-react-class' );

/**
 * Localize a React component
 * @param ComposedComponent
 * @returns A new Localized React Component
 */
module.exports = function( i18n ) {
	const i18nProps = {
		moment: i18n.moment,
		numberFormat: i18n.numberFormat.bind( i18n ),
		translate: i18n.translate.bind( i18n )
	};

	return function( ComposedComponent ) {
		const componentName = ComposedComponent.displayName || ComposedComponent.name || '';

		const component = createClass({
			displayName: 'Localized(' + componentName + ')',

			componentDidMount: function() {
				this.boundForceUpdate = this.forceUpdate.bind( this );
				i18n.stateObserver.addListener( 'change', this.boundForceUpdate );
			},

			componentWillUnmount: function() {
				// in some cases, componentWillUnmount is called before componentDidMount
				// Supposedly fixed in React 15.1.0: https://github.com/facebook/react/issues/2410
				if ( this.boundForceUpdate ) {
					i18n.stateObserver.removeListener( 'change', this.boundForceUpdate );
				}
			},

			render: function() {
				const props = assign( {}, this.props, i18nProps );
				return React.createElement( ComposedComponent, props );
			}
		} );
		component._composedComponent = ComposedComponent;
		return component;
	};
};
