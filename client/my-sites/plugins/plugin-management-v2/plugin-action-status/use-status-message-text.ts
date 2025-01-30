import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { PLUGIN_INSTALLATION_ERROR as ERROR } from 'calypso/state/plugins/installed/status/constants';
import MessagesByAction from './messages/by-action';
import type { PluginActionTypes } from '../types';
import type { PluginActionStatusForMessages } from './messages/types';

type UseStatusMessageTextOptions = {
	action: PluginActionTypes;
	status: PluginActionStatusForMessages;
	hasSelectedSite: boolean;
	hasOneStatus: boolean;
	siteCount: number;
};

const useStatusMessageText = ( {
	action,
	status,
	hasSelectedSite,
	hasOneStatus,
	siteCount,
}: UseStatusMessageTextOptions ): TranslateResult | undefined => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( status === ERROR && ! hasOneStatus ) {
			return translate( 'Failed on %(count)s site', 'Failed on %(count)s sites', {
				args: { count: siteCount },
				count: siteCount,
			} );
		}

		const messageGetter = MessagesByAction[ action ][ status ];
		const messageToTranslate = messageGetter?.( { hasSelectedSite, siteCount } );
		return messageToTranslate?.( translate );
	}, [ action, hasOneStatus, hasSelectedSite, siteCount, status, translate ] );
};

export default useStatusMessageText;
