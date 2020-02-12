/**
 * External dependencies
 */
import * as React from 'react';

function makeI18n( i18nLocale: string | undefined, localeData?: object ): I18nProps {
	delete require.cache[ require.resolve( '@wordpress/i18n' ) ];
	const { setLocaleData, __, _n, _nx, _x } = require( '@wordpress/i18n' );
	if ( localeData ) {
		setLocaleData( localeData );
	}
	return {
		__,
		_n,
		_nx,
		_x,
		i18nLocale,
	};
}

export interface I18nProps {
	__: typeof import('@wordpress/i18n').__;
	_n: typeof import('@wordpress/i18n')._n;
	_nx: typeof import('@wordpress/i18n')._nx;
	_x: typeof import('@wordpress/i18n')._x;
	i18nLocale: string | undefined;
}

const I18nContext = React.createContext< I18nProps >( makeI18n( undefined ) );

interface Props {
	/**
	 * The current locale
	 */
	locale: string;

	/**
	 * A callback that resolves with the translations data
	 */
	onLocaleChange?( newLocale: string | undefined ): Promise< object >;
}
export const I18nProvider: React.FunctionComponent< Props > = ( {
	children,
	locale,
	onLocaleChange = () => Promise.resolve( {} ),
} ) => {
	const [ contextValue, setContextValue ] = React.useState< I18nProps >( makeI18n( locale ) );
	React.useEffect( () => {
		let cancelled = false;
		const cancel = () => {
			cancelled = true;
		};
		onLocaleChange( locale ).then( nextLocaleData => {
			if ( cancelled ) {
				return;
			}

			setContextValue( makeI18n( locale, nextLocaleData ) );
		} );
		return cancel;
	}, [ locale, onLocaleChange ] );
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
export const useI18n = (): I18nProps => {
	const i18n = React.useContext( I18nContext );
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
 * @param WrappedComponent Component that will receive translate functions as props
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
	WrappedComponent: React.ComponentType< T >
): React.FunctionComponent< Optionalize< T, I18nProps > > => props => {
	const i18n = useI18n();
	return (
		<WrappedComponent
			{ ...i18n }
			// Required cast `props as T`
			// See https://github.com/Microsoft/TypeScript/issues/28938
			{ ...( props as T ) }
		/>
	);
};
