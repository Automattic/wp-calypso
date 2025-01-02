/**
 * Unlock the private apis for the global styles related functionalities and re-export them
 * on our own as this kind of internal apis might be drastically changed from time to time.
 * See https://github.com/Automattic/wp-calypso/issues/77048
 */
import { captureException } from '@automattic/calypso-sentry';
import { privateApis as blockEditorPrivateApis, transformStyles } from '@wordpress/block-editor';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../constants';
import type { GlobalStylesObject, GlobalStylesContextObject } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/block-editor'
);

const {
	cleanEmptyObject,
	ExperimentalBlockEditorProvider,
	GlobalStylesContext: UntypedGSContext,
	areGlobalStyleConfigsEqual,
	useGlobalStylesOutput,
	useGlobalSetting,
	useGlobalStyle,
} = unlock( blockEditorPrivateApis );

const GlobalStylesContext: React.Context< GlobalStylesContextObject > = UntypedGSContext;

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
		return ( props: OuterProps ) => (
			<ExperimentalBlockEditorProvider settings={ settings }>
				<InnerComponent { ...props } />
			</ExperimentalBlockEditorProvider>
		);
	},
	'withExperimentalBlockEditorProvider'
);

const useSafeGlobalStylesOutput = () => {
	try {
		return useGlobalStylesOutput();
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error: Unable to get the output of global styles. Reason: %s', error );
		captureException( error );
		return [];
	}
};

/**
 * Returns a new object, with properties specified in `properties` array.,
 * maintain the original object tree structure.
 * The function is recursive, so it will perform a deep search for the given properties.
 * E.g., the function will return `{ a: { b: { c: { test: 1 } } } }` if the properties are  `[ 'test' ]`.
 *
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
 *
 * @param {Object}   variation  The variation to compare.
 * @param {string[]} properties The properties to compare.
 * @returns {boolean} Whether the variation contains only the specified properties.
 */
const isVariationWithProperties = ( variation: GlobalStylesObject, properties: string[] ) => {
	const variationWithProperties = filterObjectByProperties(
		window.structuredClone( variation ),
		properties
	);

	return areGlobalStyleConfigsEqual( variationWithProperties, variation );
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
