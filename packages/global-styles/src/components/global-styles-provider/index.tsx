import { isEmpty, mapValues } from 'lodash';
import { useState, useMemo, useCallback } from 'react';
import { GlobalStylesContext, mergeBaseAndUserConfigs } from '../../gutenberg-bridge';
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

type SetConfig = ( callback: ( config: GlobalStylesObject ) => GlobalStylesObject ) => void;

const useGlobalStylesUserConfig = (): [ boolean, GlobalStylesObject, SetConfig ] => {
	const [ userConfig, setUserConfig ] = useState< GlobalStylesObject >( {
		settings: {},
		styles: {},
	} );
	const setConfig: SetConfig = useCallback(
		( callback ) => {
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
	return [ true, userConfig, setConfig ];
};

const useGlobalStylesBaseConfig = (
	siteId: number | string,
	stylesheet: string
): [ boolean, GlobalStylesObject | undefined ] => {
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

const GlobalStylesProvider = ( { siteId, stylesheet, children, placeholder = null }: Props ) => {
	const context = useGlobalStylesContext( siteId, stylesheet );
	if ( ! context.isReady ) {
		return placeholder;
	}
	return (
		<GlobalStylesContext.Provider value={ context }>{ children }</GlobalStylesContext.Provider>
	);
};

export default GlobalStylesProvider;
