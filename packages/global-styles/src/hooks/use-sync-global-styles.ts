import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { useContext, useEffect } from 'react';
import type { GlobalStylesObject } from '../types';

const useSyncGlobalStyles = ( globalStyles: GlobalStylesObject[], enabled: boolean ) => {
	const { setUserConfig } = useContext( GlobalStylesContext );

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		setUserConfig( () =>
			globalStyles
				.filter( Boolean )
				.reduce( ( prev, current ) => mergeBaseAndUserConfigs( prev, current ), {} )
		);
	}, [ globalStyles, enabled ] );
};

export default useSyncGlobalStyles;
