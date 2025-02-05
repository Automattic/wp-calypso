import { useEffect, useState } from 'react';
import { isSiteSettingsUntangled } from 'calypso/sites/settings/utils';

export const useIsSiteSettingsUntangled = (): boolean => {
	const [ isSiteSettingsUntangledState, setIsSiteSettingsUntangledState ] = useState( false );

	useEffect( () => {
		isSiteSettingsUntangled().then( setIsSiteSettingsUntangledState );
	}, [] );

	return isSiteSettingsUntangledState;
};
