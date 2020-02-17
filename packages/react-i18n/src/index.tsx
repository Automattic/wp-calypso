/**
 * External dependencies
 */
import * as React from 'react';
import { __, _n, _nx, _x, setLocaleData } from '@wordpress/i18n';

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
	if ( i18n === undefined ) {
		throw new Error( 'useI18n must be descendent of <I18nProvider />' );
	}
	React.useDebugValue( i18n.i18nLocale );
	return i18n;
};

/**
 * Remove from T the keys that are in common with K
 */
type Optionalize< T extends K, K > = Omit< T, keyof K >;

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
export const withI18n = < T extends I18nProps = I18nProps >(
	InnerComponent: React.ComponentType< T >
): React.FunctionComponent< Optionalize< T, I18nProps > > => {
	const WrappedComponent: React.FunctionComponent< Optionalize< T, I18nProps > > = props => (
		<I18nContext.Consumer>
			{ i18n => {
				if ( i18n === undefined ) {
					throw new Error( 'withI18n must be descendent of <I18nProvider />' );
				}
				return (
					<InnerComponent
						{ ...i18n }
						// Required cast `props as T`
						// See https://github.com/Microsoft/TypeScript/issues/28938
						{ ...( props as T ) }
					/>
				);
			} }
		</I18nContext.Consumer>
	);
	WrappedComponent.displayName = `withI18n( ${ WrappedComponent.displayName ||
		WrappedComponent.name ||
		'Component' } )`;
	return WrappedComponent;
};
