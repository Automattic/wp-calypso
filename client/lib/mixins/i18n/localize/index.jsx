/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { i18nState, moment, numberFormat, translate } from '../';

export default function localize( ComposedComponent ) {
	class LocalizedComponent extends Component {
		constructor() {
			super( ...arguments );
			this.boundForceUpdate = this.forceUpdate.bind( this );
		}

		componentDidMount() {
			i18nState.on( 'change', this.boundForceUpdate );
		}

		componentWillUnmount() {
			i18nState.off( 'change', this.boundForceUpdate );
		}

		render() {
			return (
				<ComposedComponent
					{ ...this.props }
					{ ...{ moment, numberFormat, translate } } />
			);
		}
	};

	const componentName = ComposedComponent.displayName || ComposedComponent.name || '';
	LocalizedComponent.displayName = `Localized${ componentName }`;

	return LocalizedComponent;
};
