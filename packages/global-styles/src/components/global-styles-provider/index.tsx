import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { isEmpty, mapValues } from 'lodash';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useGetGlobalStylesBaseConfig, useGetGlobalStylesUserConfig } from '../../hooks';
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

const useGlobalStylesUserConfig = ( siteId: number | string, stylesheet: string ) => {
	const { data } = useGetGlobalStylesUserConfig( siteId, stylesheet );
	const [ userConfig, setUserConfig ] = useState< GlobalStylesObject >( {
		settings: {},
		styles: {},
	} );

	const setConfig = useCallback(
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

	useEffect( () => {
		if ( data ) {
			setUserConfig( data as GlobalStylesObject );
		}
	}, [ data ] );

	return [ !! data, userConfig, setConfig ];
};

const useGlobalStylesBaseConfig = ( siteId: number | string, stylesheet: string ) => {
	const { data } = useGetGlobalStylesBaseConfig( siteId, stylesheet );

	return [ !! data, data ];
};

const useGlobalStylesContext = ( siteId: number | string, stylesheet: string ) => {
	const [ isUserConfigReady, userConfig, setUserConfig ] = useGlobalStylesUserConfig(
		siteId,
		stylesheet
	);

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
}

const GlobalStylesProvider = ( { siteId, stylesheet, children }: Props ) => {
	const context = useGlobalStylesContext( siteId, stylesheet );

	if ( ! context.isReady ) {
		return null;
	}

	return (
		<GlobalStylesContext.Provider value={ context }>{ children }</GlobalStylesContext.Provider>
	);
};

export default GlobalStylesProvider;
