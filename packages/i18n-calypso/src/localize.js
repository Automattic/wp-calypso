/** @format */

/**
 * External dependencies
 */
import React from 'react';
import createClass from 'create-react-class';

/**
 * Localize a React component
 * @param {I18N} i18n I18N instance to use for localization
 * @returns {function} Component localization function
 */
export default function( i18n ) {
	const i18nProps = {
		moment: i18n.moment,
		numberFormat: i18n.numberFormat.bind( i18n ),
		translate: i18n.translate.bind( i18n ),
	};

	/**
	 * Localize a React component
	 * @param  {React.Component} ComposedComponent React component to localize
	 * @return {React.Component}                   The localized component
	 */
	return function( ComposedComponent ) {
		const componentName = ComposedComponent.displayName || ComposedComponent.name || '';

		const component = createClass( {
			displayName: 'Localized(' + componentName + ')',

			componentDidMount() {
				this.boundForceUpdate = this.forceUpdate.bind( this );
				i18n.stateObserver.addListener( 'change', this.boundForceUpdate );
			},

			componentWillUnmount() {
				// in some cases, componentWillUnmount is called before componentDidMount
				// Supposedly fixed in React 15.1.0: https://github.com/facebook/react/issues/2410
				if ( this.boundForceUpdate ) {
					i18n.stateObserver.removeListener( 'change', this.boundForceUpdate );
				}
			},

			render() {
				const props = Object.assign(
					{
						locale: i18n.getLocaleSlug(),
					},
					this.props,
					i18nProps
				);
				return <ComposedComponent { ...props } />;
			},
		} );
		component._composedComponent = ComposedComponent;
		return component;
	};
}
