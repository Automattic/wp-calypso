/**
 * External dependencies
 */
import * as React from 'react';
import { createI18n, I18n, LocaleData, __, _n, _nx, _x, isRTL } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { createHooks, addAction } from '@wordpress/hooks';
import type { addFilter, removeFilter, applyFilters } from '@wordpress/hooks';

export interface I18nReact {
	__: I18n[ '__' ];
	_n: I18n[ '_n' ];
	_nx: I18n[ '_nx' ];
	_x: I18n[ '_x' ];
	isRTL: I18n[ 'isRTL' ];
	localeData?: LocaleData;
	hasTranslation: ( singular: string, context?: string ) => boolean;
	addFilter: typeof addFilter;
	removeFilter: typeof removeFilter;
}

/**
 * Private hooks instance.
 */
const hooks = createHooks();

/**
 * Hooks added counter.
 */
let hooksAdded = 0;

/**
 * Check if there are any i18n filters have been added.
 *
 * @returns Whether any i18n filters have been added
 */
function hasI18nFilters(): boolean {
	return hooksAdded > 0;
}

/**
 * Transmits internal hooks from the shared instance to the private one
 * due to a problem in with private hooks instances in @wordpress/hooks.
 *
 * @see  https://github.com/WordPress/gutenberg/pull/26498
 * @todo Remove when issue gets fixed in @wordpress/hooks.
 */
addAction( 'hookAdded', 'a8c/react-i18n/transmit-internal-hooks', ( ...args ) => {
	hooks.doAction( 'hookAdded', ...args );
} );
addAction( 'hookRemoved', 'a8c/react-i18n/transmit-internal-hooks', ( ...args ) => {
	hooks.doAction( 'hookRemoved', ...args );
} );

const I18nContext = React.createContext< I18nReact >( makeContextValue() );

interface Props {
	localeData?: LocaleData;
}

interface I18nFilters {
	addFilter: typeof addFilter;
	removeFilter: typeof removeFilter;
	applyFilters: typeof applyFilters;
}

export const I18nProvider: React.FunctionComponent< Props > = ( { children, localeData } ) => {
	const { addAction, removeAction, applyFilters, addFilter, removeFilter } = hooks;
	const [ filters, setFilters ] = React.useState( { applyFilters, addFilter, removeFilter } );

	React.useEffect( () => {
		addAction( 'hookAdded', 'a8c/react-i18n/filters', () => {
			setFilters( { applyFilters, addFilter, removeFilter } );
			hooksAdded++;
			return () => removeAction( 'hookAdded', 'a8c/react-i18n/filters' );
		} );
		addAction( 'hookRemoved', 'a8c/react-i18n/filters', () => {
			setFilters( { applyFilters, addFilter, removeFilter } );
			hooksAdded--;
			return () => removeAction( 'hookRemoved', 'a8c/react-i18n/filters' );
		} );
	}, [] );

	const contextValue = React.useMemo< I18nReact >(
		() => makeContextValue( localeData, { filters } ),
		[ localeData, filters ]
	);

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
	filters: I18nFilters;
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
	options: MakeContextValueOptions
) {
	const boundFn = i18n[ fnName ].bind( i18n );

	if ( ! hasI18nFilters() ) {
		return boundFn;
	}

	return ( ...args: ( string | number )[] ) => {
		const filteredArguments = options.filters.applyFilters(
			'preTranslation',
			args,
			fnName,
			options
		);

		return options.filters.applyFilters(
			'postTranslation',
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
	if ( ! localeData ) {
		return { __, _n, _nx, _x, isRTL };
	}

	const i18n = createI18n( localeData );
	const boundHasTranslation = ( singular: string, context?: string ) =>
		hasTranslation( localeData || {}, singular, context );

	const { addFilter, removeFilter, applyFilters } = options?.filters ?? hooks;
	const filters = { addFilter, removeFilter, applyFilters };
	const i18nFunctionOptions = { filters };

	return {
		__: bindI18nFunction( i18n, '__', i18nFunctionOptions ),
		_n: bindI18nFunction( i18n, '_n', i18nFunctionOptions ),
		_nx: bindI18nFunction( i18n, '_nx', i18nFunctionOptions ),
		_x: bindI18nFunction( i18n, '_x', i18nFunctionOptions ),
		isRTL: i18n.isRTL.bind( i18n ),
		localeData,
		hasTranslation: boundHasTranslation,
		addFilter,
		removeFilter,
	};
}
