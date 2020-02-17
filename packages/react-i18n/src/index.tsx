/**
 * External dependencies
 */
import * as React from 'react';
import { __, _n, _nx, _x, setLocaleData } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';

export interface I18nProps {
	__: typeof __;
	_n: typeof _n;
	_nx: typeof _nx;
	_x: typeof _x;
	i18nLocale: string;
}

const I18nContext = React.createContext< I18nProps >( makeI18n( 'en' ) );

interface Props {
	/**
	 * The current locale
	 */
	locale: string;

	/**
	 * Locale data
	 */
	localeData?: object;
}
export const I18nProvider: React.FunctionComponent< Props > = ( {
	children,
	locale,
	localeData,
} ) => {
	const [ contextValue, setContextValue ] = React.useState< I18nProps >( makeI18n( locale ) );
	React.useEffect( () => {
		setLocaleData( localeData );
		setContextValue( makeI18n( locale ) );
	}, [ locale, localeData ] );
	return <I18nContext.Provider value={ contextValue }>{ children }</I18nContext.Provider>;
};

function makeI18n( i18nLocale: string ) {
	return { __, _n, _nx, _x, i18nLocale };
}

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
export const useI18n = (): I18nProps => {
	const i18n = React.useContext( I18nContext );
	React.useDebugValue( i18n.i18nLocale );
	return i18n;
};

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
export const withI18n = createHigherOrderComponent( InnerComponent => {
	return props => {
		const i18n = useI18n();
		return <InnerComponent { ...i18n } { ...props } />;
	};
}, 'withI18n' );
