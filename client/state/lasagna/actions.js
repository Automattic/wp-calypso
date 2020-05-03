/**
 * Internal dependencies
 */
import { LASAGNA_SOCKET_CONNECTED, LASAGNA_SOCKET_DISCONNECTED } from 'state/action-types';

export const socketConnected = () => ( { type: LASAGNA_SOCKET_CONNECTED } );
export const socketDisconnected = () => ( { type: LASAGNA_SOCKET_DISCONNECTED } );
