/**
 * Unlock the private apis for the global styles related functionalities and re-export them
 * on our own as this kind of internal apis might be drastically changed from time to time.
 * See https://github.com/Automattic/wp-calypso/issues/77048
 */
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import mergeWith from 'lodash/mergeWith';
import type { GlobalStylesObject } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I know using unstable features means my plugin or theme will inevitably break on the next WordPress release.',
	'@automattic/global-styles'
);

const {
	cleanEmptyObject,
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

export {
	cleanEmptyObject,
	GlobalStylesContext,
	useGlobalStylesOutput,
	useGlobalSetting,
	useGlobalStyle,
	mergeBaseAndUserConfigs,
};
