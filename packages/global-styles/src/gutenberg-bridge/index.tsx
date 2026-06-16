/**
 * Unlock the private apis for the global styles related functionalities and re-export them
 * on our own as this kind of internal apis might be drastically changed from time to time.
 * See https://github.com/Automattic/wp-calypso/issues/77048
 *
 * The deep imports from `@wordpress/global-styles-ui/build-module/*` rely on a
 * yarn patch that widens the package's `exports` field; they aren't reachable
 * through the package's public entry.
 */
import { captureException } from '@automattic/calypso-sentry';
import { privateApis as blockEditorPrivateApis, transformStyles } from '@wordpress/block-editor';
import { getBlockTypes } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	areGlobalStylesEqual as areGlobalStyleConfigsEqual,
	generateGlobalStyles,
} from '@wordpress/global-styles-engine';
import { GlobalStylesContext as UntypedGSContext } from '@wordpress/global-styles-ui/build-module/context';
import {
	useSetting as useGlobalSetting,
	useStyle as useGlobalStyle,
} from '@wordpress/global-styles-ui/build-module/hooks';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import { useContext } from 'react';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../constants';
import type { GlobalStylesObject, GlobalStylesContextObject } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/block-editor'
);

const { cleanEmptyObject, ExperimentalBlockEditorProvider } = unlock( blockEditorPrivateApis );

const GlobalStylesContext: React.Context< GlobalStylesContextObject > =
	UntypedGSContext as unknown as React.Context< GlobalStylesContextObject >;

const mergeBaseAndUserConfigs = ( base: GlobalStylesObject, user?: GlobalStylesObject ) => {
	const mergedConfig = user ? deepmerge( base, user, { isMergeableObject: isPlainObject } ) : base;

	// Remove section style variations until we handle them
	if ( mergedConfig?.styles?.blocks ) {
		delete mergedConfig.styles.blocks.variations;
		for ( const key in mergedConfig.styles.blocks ) {
			delete mergedConfig.styles.blocks[ key ].variations;
		}
	}

	return mergedConfig;
};

const withExperimentalBlockEditorProvider = createHigherOrderComponent(
	< OuterProps extends object >( InnerComponent: React.ComponentType< OuterProps > ) => {
		const settings = {};
		const WithExperimentalBlockEditorProvider = ( props: OuterProps ) => (
			<ExperimentalBlockEditorProvider settings={ settings }>
				<InnerComponent { ...props } />
			</ExperimentalBlockEditorProvider>
		);
		return WithExperimentalBlockEditorProvider;
	},
	'withExperimentalBlockEditorProvider'
);

const useSafeGlobalStylesOutput = (): [ unknown[], Record< string, unknown > ] => {
	const { merged } = useContext( GlobalStylesContext );
	try {
		const [ stylesheets, settings ] = generateGlobalStyles(
			merged as Parameters< typeof generateGlobalStyles >[ 0 ],
			getBlockTypes()
		);
		return [ stylesheets ?? [], settings ?? {} ];
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error: Unable to get the output of global styles. Reason: %s', error );
		captureException( error );
		return [ [], {} ];
	}
};

/**
 * Returns a new object, with properties specified in `properties` array.,
 * maintain the original object tree structure.
 * The function is recursive, so it will perform a deep search for the given properties.
 * E.g., the function will return `{ a: { b: { c: { test: 1 } } } }` if the properties are  `[ 'test' ]`.
 * @param {Object}   object     The object to filter
 * @param {string[]} properties The properties to filter by
 * @returns {Object} The merged object.
 */
const filterObjectByProperties = ( object: Record< string, any >, properties: string[] ) => {
	if ( ! object || ! properties?.length ) {
		return {};
	}

	const newObject: Record< string, any > = {};
	Object.keys( object ).forEach( ( key ) => {
		if ( properties.includes( key ) && object[ key ] !== null ) {
			newObject[ key ] = object[ key ];
		} else if ( typeof object[ key ] === 'object' ) {
			const newFilter = filterObjectByProperties(
				object[ key ] as Record< string, any >,
				properties
			);
			if ( Object.keys( newFilter ).length ) {
				newObject[ key ] = newFilter;
			}
		}
	} );
	return newObject;
};

/**
 * Compares a style variation to the same variation filtered by the specified properties.
 * Returns true if the variation contains only the properties specified.
 * @param {Object}   variation  The variation to compare.
 * @param {string[]} properties The properties to compare.
 * @returns {boolean} Whether the variation contains only the specified properties.
 */
const isVariationWithProperties = ( variation: GlobalStylesObject, properties: string[] ) => {
	const clonedVariation = window.structuredClone
		? window.structuredClone( variation )
		: JSON.parse( JSON.stringify( variation ) );
	const variationWithProperties = filterObjectByProperties(
		clonedVariation,
		properties
	) as GlobalStylesObject;

	// Calypso's GlobalStylesObject differs structurally from the
	// `@wordpress/global-styles-engine` `GlobalStylesConfig` (notably
	// `styles.color`), but `areGlobalStylesEqual` only deep-equals the
	// `styles` and `settings` slices, so the runtime contract holds.
	type AreEqualParam = Parameters< typeof areGlobalStyleConfigsEqual >[ 0 ];
	return areGlobalStyleConfigsEqual(
		variationWithProperties as unknown as AreEqualParam,
		variation as unknown as AreEqualParam
	);
};

const isColorVariation = ( variation?: GlobalStylesObject ) =>
	variation && isVariationWithProperties( variation, [ 'color' ] );

const isFontVariation = ( variation?: GlobalStylesObject ) => {
	// The `settings.color` of the font variation is `null` if the endpoint only returns this property.
	return (
		variation &&
		( isVariationWithProperties( variation, [ 'typography' ] ) ||
			variation.settings?.color === null )
	);
};

const isDefaultVariation = ( variation?: GlobalStylesObject ) =>
	variation?.slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;

const isStyleVariation = ( variation?: GlobalStylesObject ) =>
	variation &&
	! isDefaultVariation( variation ) &&
	! isColorVariation( variation ) &&
	! isFontVariation( variation );

export {
	cleanEmptyObject,
	ExperimentalBlockEditorProvider,
	GlobalStylesContext,
	isColorVariation,
	isFontVariation,
	isDefaultVariation,
	isStyleVariation,
	transformStyles,
	useSafeGlobalStylesOutput,
	useGlobalSetting,
	useGlobalStyle,
	mergeBaseAndUserConfigs,
	withExperimentalBlockEditorProvider,
};
