/**
 * Unlock the private apis for the global styles related functionalities and re-export them
 * on our own as this kind of internal apis might be drastically changed from time to time.
 * See https://github.com/Automattic/wp-calypso/issues/77048
 */
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import mergeWith from 'lodash/mergeWith';
import type { GlobalStylesObject } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I know using unstable features means my plugin or theme will inevitably break on the next WordPress release.',
	'@wordpress/block-editor'
);

const {
	cleanEmptyObject,
	ExperimentalBlockEditorProvider,
	GlobalStylesContext,
	useGlobalStylesOutput,
	useGlobalSetting,
	useGlobalStyle,
} = unlock( blockEditorPrivateApis );

const mergeBaseAndUserConfigs = ( base: GlobalStylesObject, user: GlobalStylesObject ) => {
	const mergeTreesCustomizer = ( _: unknown, srcValue: unknown ) => {
		// We only pass as arrays the presets,
		// in which case we want the new array of values
		// to override the old array (no merging).
		if ( Array.isArray( srcValue ) ) {
			return srcValue;
		}
	};

	return mergeWith( {}, base, user, mergeTreesCustomizer );
};

const withExperimentalBlockEditorProvider = createHigherOrderComponent(
	< OuterProps, >( InnerComponent: React.ComponentType< OuterProps > ) => {
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

export {
	cleanEmptyObject,
	ExperimentalBlockEditorProvider,
	GlobalStylesContext,
	useGlobalStylesOutput,
	useGlobalSetting,
	useGlobalStyle,
	mergeBaseAndUserConfigs,
	withExperimentalBlockEditorProvider,
};
