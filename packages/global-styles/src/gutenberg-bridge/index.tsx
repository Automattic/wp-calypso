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
import type { GlobalStylesObject, GlobalStylesContextObject } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/block-editor'
);

const {
	cleanEmptyObject,
	ExperimentalBlockEditorProvider,
	GlobalStylesContext: UntypedGSContext,
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

export {
	cleanEmptyObject,
	ExperimentalBlockEditorProvider,
	GlobalStylesContext,
	transformStyles,
	useSafeGlobalStylesOutput,
	useGlobalSetting,
	useGlobalStyle,
	mergeBaseAndUserConfigs,
	withExperimentalBlockEditorProvider,
};
