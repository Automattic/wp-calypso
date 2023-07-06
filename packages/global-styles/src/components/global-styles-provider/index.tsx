import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { isEmpty, mapValues } from 'lodash';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useGetGlobalStylesBaseConfig } from '../../hooks';
import type { GlobalStylesObject } from '../../types';

const cleanEmptyObject = ( object: any ) => {
	if ( object === null || typeof object !== 'object' || Array.isArray( object ) ) {
		return object;
	}
	const cleanedNestedObjects: any = Object.fromEntries(
		Object.entries( mapValues( object, cleanEmptyObject ) ).filter( ( [ , value ] ) =>
			Boolean( value )
		)
	);
	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

const useGlobalStylesUserConfig = () => {
	const [ userConfig, setUserConfig ] = useState< GlobalStylesObject >( {
		settings: {},
		styles: {},
	} );

	const setConfig = useCallback(
		( callback: ( config: GlobalStylesObject ) => GlobalStylesObject ) => {
			setUserConfig( ( currentConfig ) => {
				const updatedConfig = callback( currentConfig );
				return {
					styles: cleanEmptyObject( updatedConfig.styles ) || {},
					settings: cleanEmptyObject( updatedConfig.settings ) || {},
				};
			} );
		},
		[ setUserConfig ]
	);

	return [ !! true, userConfig, setConfig ];
};

const useGlobalStylesBaseConfig = ( siteId: number | string, stylesheet: string ) => {
	const { data } = useGetGlobalStylesBaseConfig( siteId, stylesheet );

	return [ !! data, data ];
};

const useGlobalStylesContext = ( siteId: number | string, stylesheet: string ) => {
	const [ isUserConfigReady, userConfig, setUserConfig ] = useGlobalStylesUserConfig();

	const [ isBaseConfigReady, baseConfig ] = useGlobalStylesBaseConfig( siteId, stylesheet );

	const mergedConfig = useMemo( () => {
		if ( ! baseConfig || ! userConfig ) {
			return {};
		}
		return mergeBaseAndUserConfigs( baseConfig, userConfig );
	}, [ userConfig, baseConfig ] );

	const context = useMemo( () => {
		return {
			isReady: isUserConfigReady && isBaseConfigReady,
			user: userConfig,
			base: baseConfig,
			merged: mergedConfig,
			setUserConfig,
		};
	}, [
		mergedConfig,
		userConfig,
		baseConfig,
		setUserConfig,
		isUserConfigReady,
		isBaseConfigReady,
	] );

	return context;
};

interface Props {
	siteId: number | string;
	stylesheet: string;
	children: JSX.Element;
	placeholder: JSX.Element | null;
}

let blocksRegistered = false;

const GlobalStylesProvider = ( { siteId, stylesheet, children, placeholder = null }: Props ) => {
	const context = useGlobalStylesContext( siteId, stylesheet );

	useEffect( () => {
		if ( blocksRegistered ) {
			return;
		}

		blocksRegistered = true;

		// The block-level styles have effects only when the specific blocks are registered so we have to register core blocks.
		// See https://github.com/WordPress/gutenberg/blob/16486bd946f918d581e4818b73ceaaed82349f71/packages/block-editor/src/components/global-styles/use-global-styles-output.js#L1190
		import( '@wordpress/block-library' ).then(
			( { registerCoreBlocks }: typeof import('@wordpress/block-library') ) => registerCoreBlocks()
		);
	}, [] );

	if ( ! context.isReady ) {
		return placeholder;
	}

	return (
		<GlobalStylesContext.Provider value={ context }>{ children }</GlobalStylesContext.Provider>
	);
};

export default GlobalStylesProvider;
