import { ReactNode } from 'react';
import type { ConnectSocialUserArgs } from '@automattic/api-core';

export type SocialLoginButtonProps = {
	children?: ReactNode;
	responseHandler: ( response: ConnectSocialUserArgs ) => void;
	redirectUri?: string;
	isConnected: boolean;
	handleDisconnect: () => void;
	isLoading: boolean;
	socialServiceResponse?: any;
};
