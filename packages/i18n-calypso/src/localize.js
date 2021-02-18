/**
 * External dependencies
 */
import React from 'react';

/**
 * Localize a React component
 *
 * @param {object} i18n I18N instance to use for localization
 * @returns {Function} Component localization function
 */
export default function ( i18n ) {
	const i18nProps = {
		numberFormat: i18n.numberFormat.bind( i18n ),
		translate: i18n.translate.bind( i18n ),
	};

	/**
	 * Localize a React component
	 *
	 * @param  {React.Component} ComposedComponent React component to localize
	 * @returns {React.Component}                   The localized component
	 */
	return function ( ComposedComponent ) {
		const componentName = ComposedComponent.displayName || ComposedComponent.name || '';

		return class extends React.Component {
			static displayName = 'Localized(' + componentName + ')';

			boundForceUpdate = this.forceUpdate.bind( this );

			componentDidMount() {
				i18n.on( 'change', this.boundForceUpdate );
			}

			componentWillUnmount() {
				i18n.off( 'change', this.boundForceUpdate );
			}

			render() {
				const props = {
					locale: i18n.getLocaleSlug(),
					...this.props,
					...i18nProps,
				};
				return <ComposedComponent { ...props } />;
			}
		};
	};
}
