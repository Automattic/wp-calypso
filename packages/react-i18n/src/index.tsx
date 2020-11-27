/**
 * External dependencies
 */
import * as React from 'react';
import { createI18n, I18n, LocaleData, __, _n, _nx, _x, isRTL } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';

export interface I18nReact {
	__: I18n[ '__' ];
	_n: I18n[ '_n' ];
	_nx: I18n[ '_nx' ];
	_x: I18n[ '_x' ];
	isRTL: I18n[ 'isRTL' ];
}

const I18nContext = React.createContext< I18nReact >( makeContextValue() );

interface Props {
	localeData?: LocaleData;
}

export const I18nProvider: React.FunctionComponent< Props > = ( { children, localeData } ) => {
	const contextValue = React.useMemo< I18nReact >( () => makeContextValue( localeData ), [
		localeData,
	] );
	return <I18nContext.Provider value={ contextValue }>{ children }</I18nContext.Provider>;
};

/**
 * React hook providing i18n translate functions
 *
 * @example
 *
 * import { useI18n } from '@automattic/react-i18n';
 * function MyComponent() {
 *   const { __ } = useI18n();
 *   return <div>{ __( 'Translate me.', 'text-domain' ) }</div>;
 * }
 */
export const useI18n = (): I18nReact => React.useContext( I18nContext );

/**
 * React hook providing i18n translate functions
 *
 * @param InnerComponent Component that will receive translate functions as props
 * @returns Component enhanced with i18n context
 *
 * @example
 *
 * import { withI18n } from '@automattic/react-i18n';
 * function MyComponent( { __ } ) {
 *   return <div>{ __( 'Translate me.', 'text-domain' ) }</div>;
 * }
 * export default withI18n( MyComponent );
 */
export const withI18n = createHigherOrderComponent< I18nReact >( ( InnerComponent ) => {
	return ( props ) => {
		const i18n = useI18n();
		return <InnerComponent { ...i18n } { ...props } />;
	};
}, 'withI18n' );

/**
 * Utility to make a new context value
 *
 * @param localeData The localeData
 *
 * @returns The context value with bound translation functions
 */
function makeContextValue( localeData?: LocaleData ): I18nReact {
	if ( ! localeData ) {
		return { __, _n, _nx, _x, isRTL };
	}

	const i18n = createI18n( localeData );

	return {
		__: i18n.__.bind( i18n ),
		_n: i18n._n.bind( i18n ),
		_nx: i18n._nx.bind( i18n ),
		_x: i18n._x.bind( i18n ),
		isRTL: i18n.isRTL.bind( i18n ),
	};
}
