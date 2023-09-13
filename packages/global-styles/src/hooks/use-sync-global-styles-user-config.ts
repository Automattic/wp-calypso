import { useContext, useEffect } from 'react';
import { GlobalStylesContext, mergeBaseAndUserConfigs } from '../gutenberg-bridge';
import type { GlobalStylesObject } from '../types';

const useSyncGlobalStylesUserConfig = (
	globalStyles: GlobalStylesObject[],
	onChange?: ( globalStyle?: GlobalStylesObject | null ) => void
) => {
	const { user, setUserConfig } = useContext( GlobalStylesContext );
	useEffect( () => {
		setUserConfig?.( () =>
			globalStyles
				.filter( Boolean )
				.reduce(
					( prev, current ) => mergeBaseAndUserConfigs( prev, current ),
					{} as GlobalStylesObject
				)
		);
	}, [ globalStyles ] );

	useEffect( () => {
		onChange?.( user );
	}, [ user ] );

	return user;
};

export default useSyncGlobalStylesUserConfig;
