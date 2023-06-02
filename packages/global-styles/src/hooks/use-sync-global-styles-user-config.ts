import { useContext, useEffect } from 'react';
import { GlobalStylesContext, mergeBaseAndUserConfigs } from '../gutenberg-bridge';
import type { GlobalStylesObject } from '../types';

const useSyncGlobalStylesUserConfig = ( globalStyles: GlobalStylesObject[] ) => {
	const { user, setUserConfig } = useContext( GlobalStylesContext );
	useEffect( () => {
		setUserConfig( () =>
			globalStyles
				.filter( Boolean )
				.reduce(
					( prev, current ) => mergeBaseAndUserConfigs( prev, current ),
					{} as GlobalStylesObject
				)
		);
	}, [ globalStyles ] );
	return user;
};

export default useSyncGlobalStylesUserConfig;
