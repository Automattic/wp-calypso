import type { ConnectSocialUserArgs } from '@automattic/api-core';

export type SocialLoginButtonProps = {
	responseHandler: ( response: ConnectSocialUserArgs ) => void;
	redirectUri?: string;
	isConnected: boolean;
	handleDisconnect: () => void;
	isLoading: boolean;
};

export type AppleClient = {
	auth: {
		init: ( options: {
			clientId: string;
			redirectURI: string;
			state: string;
			scope: string;
		} ) => void;
		signIn: () => void;
	};
};
