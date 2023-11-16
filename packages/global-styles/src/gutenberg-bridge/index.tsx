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
	'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
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

const mergeBaseAndUserConfigs = ( base: GlobalStylesObject, user: GlobalStylesObject ) => {
	return deepmerge( base, user, { isMergeableObject: isPlainObject } );
};

const withExperimentalBlockEditorProvider = createHigherOrderComponent(
	< OuterProps extends object >( InnerComponent: React.ComponentType< OuterProps > ) => {
		// Use fake assets to eliminate the compatStyles without the id.
		// See https://github.com/WordPress/gutenberg/blob/f77958cfc13c02b0c0e6b9b697b43bbcad4ba40b/packages/block-editor/src/components/iframe/index.js#L127
		const settings = {
			__unstableResolvedAssets: {
				styles: '<style id="" />',
			},
		};

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
