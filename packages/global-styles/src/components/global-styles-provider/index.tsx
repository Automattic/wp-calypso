import { useState, useMemo, useCallback } from 'react';
import { DEFAULT_GLOBAL_STYLES } from '../../constants';
import { GlobalStylesContext, mergeBaseAndUserConfigs } from '../../gutenberg-bridge';
import { useGetGlobalStylesBaseConfig, useRegisterCoreBlocks } from '../../hooks';
import type { GlobalStylesObject, SetConfig, SetConfigCallback } from '../../types';

const cleanEmptyObject = < T extends Record< string, unknown > >( object: T | unknown ) => {
	if ( object === null || typeof object !== 'object' || Array.isArray( object ) ) {
		return object;
	}
	const cleanedNestedObjects: T = Object.fromEntries(
		Object.entries( object )
			.map( ( [ key, value ] ) => [ key, cleanEmptyObject( value ) ] )
			.filter( ( [ , value ] ) => value !== undefined )
	);

	return Object.keys( cleanedNestedObjects ).length > 0 ? cleanedNestedObjects : undefined;
};

const useGlobalStylesUserConfig = (): [ boolean, GlobalStylesObject, SetConfig ] => {
	const [ userConfig, setUserConfig ] = useState< GlobalStylesObject >( {
		settings: {},
		styles: {},
	} );
	const setConfig = useCallback(
		( callback: SetConfigCallback ) => {
			setUserConfig( ( currentConfig ) => {
				const updatedConfig = callback( currentConfig );
				return {
					styles: cleanEmptyObject( updatedConfig.styles ) || {},
					settings: cleanEmptyObject( updatedConfig.settings ) || {},
				} as GlobalStylesObject;
			} );
		},
		[ setUserConfig ]
	);
	return [ true, userConfig, setConfig ];
};

const useGlobalStylesBaseConfig = (
	stylesheet: string
): [ boolean, GlobalStylesObject | undefined ] => {
	const { data } = useGetGlobalStylesBaseConfig( stylesheet );
	return [ !! data, data ];
};

const useGlobalStylesContext = ( stylesheet: string ) => {
	const [ isUserConfigReady, userConfig, setUserConfig ] = useGlobalStylesUserConfig();
	const [ isBaseConfigReady, baseConfig = DEFAULT_GLOBAL_STYLES ] =
		useGlobalStylesBaseConfig( stylesheet );
	const mergedConfig = useMemo( () => {
		if ( ! baseConfig || ! userConfig ) {
			return DEFAULT_GLOBAL_STYLES;
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

const GlobalStylesProvider = ( { stylesheet, children, placeholder = null }: Props ) => {
	const context = useGlobalStylesContext( stylesheet );
	const isBlocksRegistered = useRegisterCoreBlocks();

	if ( ! context.isReady || ! isBlocksRegistered ) {
		return placeholder;
	}
	return (
		<GlobalStylesContext.Provider value={ context }>{ children }</GlobalStylesContext.Provider>
	);
};

export default GlobalStylesProvider;
