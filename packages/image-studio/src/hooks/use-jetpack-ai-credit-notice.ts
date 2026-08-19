import { getAgentsManagerInlineData } from '@automattic/agents-manager';
import {
	type JetpackAiChatNotice,
	useJetpackFreeCreditChatNotice,
} from '@automattic/jetpack-ai-sidebar/free-credit-notice';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { openImageStudioUpgradeUrl } from '../utils/open-upgrade-url';
import { trackImageStudioUpgradeNoticeShown } from '../utils/tracking';
import type { ImageStudioMode } from '../types';

interface UseJetpackAiCreditNoticeOptions {
	error: string | null;
	isVideoMode: boolean;
	mode: ImageStudioMode;
	rejectionNotice?: JetpackAiChatNotice;
	settledRequestCount: number;
}

export function useJetpackAiCreditNotice( {
	error,
	isVideoMode,
	mode,
	rejectionNotice,
	settledRequestCount,
}: UseJetpackAiCreditNoticeOptions ): JetpackAiChatNotice | undefined {
	const inlineData = getAgentsManagerInlineData();
	const trackedStatusExhaustion = useRef( false );
	const onUpgradeClick = useCallback(
		( upgradeUrl: string ) => openImageStudioUpgradeUrl( upgradeUrl, mode ),
		[ mode ]
	);
	const notice = useJetpackFreeCreditChatNotice( {
		error,
		enabled: ! isVideoMode,
		isWpcomPlatform: inlineData?.isWpcomPlatform,
		onUpgradeClick,
		rejectionNotice,
		settledRequestCount,
		siteId: inlineData?.site?.ID,
	} );
	const isStatusExhaustion = error === null && ! rejectionNotice && notice?.status === 'error';

	useEffect( () => {
		if ( ! isStatusExhaustion ) {
			if ( notice?.status !== 'error' ) {
				trackedStatusExhaustion.current = false;
			}
			return;
		}

		if ( ! trackedStatusExhaustion.current ) {
			trackedStatusExhaustion.current = true;
			trackImageStudioUpgradeNoticeShown( { mode } );
		}
	}, [ isStatusExhaustion, mode, notice?.status ] );

	return notice;
}
