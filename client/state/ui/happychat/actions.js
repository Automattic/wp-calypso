import {
	HAPPYCHAT_OPEN
} from 'state/action-types';

import { setChatClosing } from 'state/happychat/actions';

const setChatOpen = isOpen => ( { type: HAPPYCHAT_OPEN, isOpen } );

export const openChat = () => setChatOpen( true );

export const closeChat = () => ( dispatch ) => {
	dispatch( setChatOpen( false ) );
	dispatch( setChatClosing() );
};
