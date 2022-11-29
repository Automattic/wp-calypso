import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	initConnection,
	sendMessage,
	sendUserInfo,
	setChatCustomFields,
} from 'calypso/state/happychat/connection/actions';
import getHappychatUserInfo from 'calypso/state/happychat/selectors/get-happychat-userinfo';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isHappychatConnectionUninitialized from 'calypso/state/happychat/selectors/is-happychat-connection-uninitialized';
import { openChat, closeChat } from 'calypso/state/happychat/ui/actions';
import { getHappychatAuth } from 'calypso/state/happychat/utils';
import type { SiteDetails } from '@automattic/data-stores/src/site';

type GetHappyChatUserInfo = ( arg: { site: SiteDetails } ) => object;

export default function useHappyChat() {
	const dispatch = useDispatch();
	const isAvailable = useSelector( isHappychatAvailable );
	const hasActiveSession = useSelector( hasActiveHappychatSession );
	const isUninitialized = useSelector( isHappychatConnectionUninitialized );
	const getAuth = useSelector( getHappychatAuth );
	const getUserInfo = useSelector( getHappychatUserInfo ) as GetHappyChatUserInfo;

	useEffect( () => {
		if ( isUninitialized ) {
			dispatch( initConnection( getAuth() ) );
		}
	}, [] );

	return {
		isInitialized: ! isUninitialized,
		isAvailable,
		hasActiveSession,
		open: () => dispatch( openChat() ),
		close: () => dispatch( closeChat() ),
		sendMessage: ( message: object, meta?: object ) => dispatch( sendMessage( message, meta ) ),
		sendUserInfo: ( info: object ) => dispatch( sendUserInfo( info ) ),
		setChatCustomFields: ( fields: object ) => dispatch( setChatCustomFields( fields ) ),
		getUserInfo,
	};
}
