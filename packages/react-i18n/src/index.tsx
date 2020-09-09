/**
 * External dependencies
 */
import * as React from 'react';
import { createI18n, I18n, LocaleData } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { createHooks } from '@wordpress/hooks';

export interface I18nReact {
	__: I18n[ '__' ];
	_n: I18n[ '_n' ];
	_nx: I18n[ '_nx' ];
	_x: I18n[ '_x' ];
	isRTL: I18n[ 'isRTL' ];
	i18nLocale: string;
	localeData?: LocaleData;
	hasTranslation: Function;
	addFilter?: Function;
	removeFilter?: Function;
	applyFilters?: Function;
}

const I18nContext = React.createContext< I18nReact >( makeContextValue() );

interface Props {
	localeData?: LocaleData;
}

const FILTER_PREFIX = 'a8c.reactI18n';

const useFilters = (): any => {
	const [ , setFiltersUpdates ] = React.useState( 0 ); // State is only used to provide reactivity when add/removing filters
	const { filters, addFilter, removeFilter, applyFilters } = React.useMemo(
		() => createHooks(),
		[]
	);

	const bindFn = ( fn, shouldUpdate = true ) => ( ...args ) => {
		args[ 0 ] = `${ FILTER_PREFIX }.${ args[ 0 ] }`; // Apply hook name prefix
		const result = fn( ...args );

		if ( shouldUpdate ) {
			setFiltersUpdates( ( i ) => ++i );
		}

		return result;
	};

	return {
		filters,
		addFilter: bindFn( addFilter ),
		removeFilter: bindFn( removeFilter ),
		applyFilters: bindFn( applyFilters, false ),
	};
};

export const I18nProvider: React.FunctionComponent< Props > = ( { children, localeData } ) => {
	const options = {
		filters: useFilters(),
	};
	const contextValue = React.useMemo< I18nReact >( () => makeContextValue( localeData, options ), [
		localeData,
		options,
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

interface MakeContextValueOptions {
	translation?: I18nTransformHooks;
	lookup?: I18nTransformHooks;
}

/**
 * Bind an I18n function to its instance
 *
 * @param i18n I18n instance
 * @param fnName '__' | '_n' | '_nx' | '_x'
 * @param options Make context value options object
 * @returns Bound I18n function with applied transformation hooks
 */
function bindI18nFunction(
	i18n: I18n,
	fnName: '__' | '_n' | '_nx' | '_x',
	options?: MakeContextValueOptions
) {
	const boundFn = i18n[ fnName ].bind( i18n );

	if ( ! options?.filters ) {
		return boundFn;
	}

	return ( ...args: ( string | number )[] ) => {
		const filteredArguments = options.filters.applyFilters( 'arguments', args, fnName, options );

		return options.filters.applyFilters(
			'translation',
			boundFn( ...filteredArguments ),
			filteredArguments,
			fnName,
			options
		);
	};
}

const CONTEXT_DELIMETER = '\u0004';

/**
 * Check if provided translation entry exists in locale data for provided singular and context
 *
 * @param localeData Locale data object
 * @param singular Translation singular string
 * @param context Gettext context
 */
function hasTranslation( localeData: LocaleData, singular: string, context?: string ): boolean {
	const key =
		typeof context === 'string' ? ''.concat( context, CONTEXT_DELIMETER, singular ) : singular;

	return key in localeData;
}

/**
 * Utility to make a new context value
 *
 * @param localeData The localeData
 * @param options Context options object
 *
 * @returns The context value with bound translation functions
 */
function makeContextValue( localeData?: LocaleData, options?: MakeContextValueOptions ): I18nReact {
	const i18n = createI18n( localeData );
	const i18nLocale = localeData?.[ '' ]?.localeSlug ?? 'en';
	const boundHasTranslation = ( singular: string, context?: string ) =>
		hasTranslation( localeData || {}, singular, context );

	return {
		__: bindI18nFunction( i18n, '__', options ),
		_n: bindI18nFunction( i18n, '_n', options ),
		_nx: bindI18nFunction( i18n, '_nx', options ),
		_x: bindI18nFunction( i18n, '_x', options ),
		isRTL: i18n.isRTL.bind( i18n ),
		i18nLocale,
		localeData,
		hasTranslation: boundHasTranslation,
		addFilter: options?.filters?.addFilter,
		removeFilter: options?.filters?.removeFilter,
		applyFilters: options?.filters?.applyFilters,
	};
}
