import { TEST_ACCOUNT_NAMES } from '.';

type OtherTestSiteName = 'notifications';
export type TestAccountName = ( typeof TEST_ACCOUNT_NAMES )[ number ];

interface TestAccountSites {
	id: number;
	url: string;
	remotePassword?: string;
}

export interface TestAccountCredentials {
	username: string;
	password: string;
	userID?: number;
	email?: string;
	testSites?: {
		primary: TestAccountSites;
	};
	primarySite?: string;
	otherSites?: string[];
	totpKey?: string;
	smsNumber?: {
		number: string;
		code: string;
	};
}

export interface Secrets {
	storeSandboxCookieValue: string;
	testCouponCode: string;
	wpccAuthPath: string;
	wooSignupPath: string;
	wooLoginPath: string;
	calypsoOauthApplication: {
		client_id: string;
		client_secret: string;
	};
	martechTosUploadCredentials: {
		bearer_token: string;
	};
	socialAccounts: {
		tumblr: {
			username: string;
			password: string;
		};
	};
	mailosaur: {
		apiKey: string;
		inviteInboxId: string;
		signupInboxId: string;
		domainsInboxId: string;
		defaultUserInboxId: string;
		totpUserInboxId: string;
		manualTesting: string;
	};
	testAccounts: {
		[ key in TestAccountName ]: TestAccountCredentials;
	};
	otherTestSites: {
		[ key in OtherTestSiteName ]: string;
	};
}
