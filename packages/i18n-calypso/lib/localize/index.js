/** @format */
/**
 * External dependencies
 */
import { Component, createElement } from 'react';

/**
 * Localize a React component
 * @param ComposedComponent
 * @returns A new Localized React Component
 */
export default function( i18n ) {
	const i18nProps = {
		moment: i18n.moment,
		numberFormat: i18n.numberFormat.bind( i18n ),
		translate: i18n.translate.bind( i18n ),
	};

	return function( ComposedComponent ) {
		const componentName = ComposedComponent.displayName || ComposedComponent.name || '';

		class component extends Component {
			static displayName = 'Localized(' + componentName + ')';

			componentDidMount() {
				this.boundForceUpdate = this.forceUpdate.bind( this );
				i18n.stateObserver.addListener( 'change', this.boundForceUpdate );
			}

			componentWillUnmount() {
				// in some cases, componentWillUnmount is called before componentDidMount
				// Supposedly fixed in React 15.1.0: https://github.com/facebook/react/issues/2410
				if ( this.boundForceUpdate ) {
					i18n.stateObserver.removeListener( 'change', this.boundForceUpdate );
				}
			}

			render() {
				return createElement( ComposedComponent, { ...this.props, ...i18nProps } );
			}
		}
		component._composedComponent = ComposedComponent;
		return component;
	};
}
