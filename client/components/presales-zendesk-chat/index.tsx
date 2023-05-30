import { HelpCenter } from '@automattic/data-stores';
import { loadScript } from '@automattic/load-script';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import type { HelpCenterSelect } from '@automattic/data-stores';

interface Props {
	chatKey: string | false;
}

const ZENDESK_SCRIPT_ID = 'ze-snippet';
const HELP_CENTER_STORE = HelpCenter.register();

const ZendeskChat = ( { chatKey }: Props ) => {
	useEffect( () => {
		if ( ! chatKey ) {
			return;
		}

		if ( document.getElementById( ZENDESK_SCRIPT_ID ) ) {
			return;
		}

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( chatKey ),
			undefined,
			{ id: ZENDESK_SCRIPT_ID }
		);
	}, [ chatKey ] );

	const { setShowMessagingLauncher } = useDispatch( HELP_CENTER_STORE );
	const { isMessagingWidgetShown } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isMessagingWidgetShown: helpCenterSelect.isMessagingWidgetShown(),
		};
	}, [] );

	useEffect( () => {
		setShowMessagingLauncher( true );
		return () => {
			if ( ! isMessagingWidgetShown ) {
				setShowMessagingLauncher( false );
			}
		};
	}, [ setShowMessagingLauncher, isMessagingWidgetShown ] );

	return null;
};

export default ZendeskChat;
