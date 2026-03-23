import { Spinner } from '@automattic/components';
import React from 'react';

type GetTelegramConnectionDescriptionArgs = {
	isStatusReady: boolean;
	isConnected: boolean;
	connectedDescription: React.ReactNode;
	disconnectedDescription?: React.ReactNode;
};

export function getTelegramConnectionDescription( {
	isStatusReady,
	isConnected,
	connectedDescription,
	disconnectedDescription,
}: GetTelegramConnectionDescriptionArgs ) {
	if ( ! isStatusReady ) {
		return <Spinner />;
	}

	if ( isConnected ) {
		return connectedDescription;
	}

	return disconnectedDescription ?? null;
}
