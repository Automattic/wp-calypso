/**
 * External dependencies
 */
import * as React from 'react';

import {
	createI18n,
	I18n,
	LocaleData,
	__,
	_n,
	_nx,
	_x,
	isRTL,
	setLocaleData,
} from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { createHooks } from '@wordpress/hooks';
import type { addFilter, removeFilter, hasFilter, applyFilters } from '@wordpress/hooks';

/**
 * Default i18n instance.
 */
const defaultI18n: I18n = { __, _n, _nx, _x, isRTL, setLocaleData };

export interface I18nReact {
	__: I18n[ '__' ];
	_n: I18n[ '_n' ];
	_nx: I18n[ '_nx' ];
	_x: I18n[ '_x' ];
	isRTL: I18n[ 'isRTL' ];
	localeData?: LocaleData;
	hasTranslation?: ( singular: string, context?: string ) => boolean;
	addFilter: typeof addFilter;
	removeFilter: typeof removeFilter;
}

const I18nContext = React.createContext< I18nReact >( makeContextValue() );

interface Props {
	localeData?: LocaleData;
}

interface I18nFilters {
	addFilter: typeof addFilter;
	removeFilter: typeof removeFilter;
	hasFilter: typeof hasFilter;
	applyFilters: typeof applyFilters;
}

export const I18nProvider: React.FunctionComponent< Props > = ( { children, localeData } ) => {
	const hooks = React.useMemo( () => createHooks(), [] );
	const { addAction, removeAction, addFilter, removeFilter, hasFilter, applyFilters } = hooks;
	const [ filters, setFilters ] = React.useState( {
		addFilter,
		removeFilter,
		hasFilter,
		applyFilters,
	} );

	React.useEffect( () => {
		addAction( 'hookAdded', 'a8c/react-i18n/filters', () => {
			setFilters( { addFilter, removeFilter, hasFilter, applyFilters } );
			return () => removeAction( 'hookAdded', 'a8c/react-i18n/filters' );
		} );
		addAction( 'hookRemoved', 'a8c/react-i18n/filters', () => {
			setFilters( { addFilter, removeFilter, hasFilter, applyFilters } );
			return () => removeAction( 'hookRemoved', 'a8c/react-i18n/filters' );
		} );
	}, [] );

	const contextValue = React.useMemo< I18nReact >( () => makeContextValue( localeData, filters ), [
		localeData,
		filters,
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
 * Bind an I18n function to its instance
 *
 * @param i18n I18n instance
 * @param fnName '__' | '_n' | '_nx' | '_x'
 * @param filters Make context filters instance
 * @returns Bound I18n function with applied transformation hooks
 */
function bindI18nFunction( i18n: I18n, fnName: '__' | '_n' | '_nx' | '_x', filters: I18nFilters ) {
	const translateFn = i18n[ fnName ];
	const { hasFilter, applyFilters } = filters;

	if ( ! hasFilter( 'preTranslation' ) && ! hasFilter( 'postTranslation' ) ) {
		return translateFn;
	}

	return ( ...args: ( string | number )[] ) => {
		const filteredArguments = applyFilters( 'preTranslation', args, fnName, filters ) as (
			| string
			| number
		 )[];

		return applyFilters(
			'postTranslation',
			translateFn( ...filteredArguments ),
			filteredArguments,
			fnName,
			filters
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
 * @param filters Context filters instance
 *
 * @returns The context value with bound translation functions
 */
function makeContextValue( localeData?: LocaleData, filters?: I18nFilters ): I18nReact {
	const i18n = localeData ? createI18n( localeData ) : defaultI18n;
	const boundHasTranslation = localeData
		? ( singular: string, context?: string ) => hasTranslation( localeData, singular, context )
		: undefined;

	const { addFilter, removeFilter, hasFilter, applyFilters } = filters ?? createHooks();
	const i18nFunctionFilters = { addFilter, removeFilter, hasFilter, applyFilters };

	return {
		__: bindI18nFunction( i18n, '__', i18nFunctionFilters ),
		_n: bindI18nFunction( i18n, '_n', i18nFunctionFilters ),
		_nx: bindI18nFunction( i18n, '_nx', i18nFunctionFilters ),
		_x: bindI18nFunction( i18n, '_x', i18nFunctionFilters ),
		isRTL: i18n.isRTL,
		localeData,
		hasTranslation: boundHasTranslation,
		addFilter,
		removeFilter,
	};
}
