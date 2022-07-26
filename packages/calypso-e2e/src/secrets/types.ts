import { TEST_ACCOUNT_NAMES } from '.';

type OtherTestSiteName = 'notifications';
export type TestAccountName = typeof TEST_ACCOUNT_NAMES[ number ];

interface TestAccountSites {
	id: number;
	url: string;
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
	passwordForNewTestSignUps: string;
	storeSandboxCookieValue: string;
	testCouponCode: string;
	wpccAuthPath: string;
	calypsoOauthApplication: {
		client_id: string;
		client_secret: string;
	};
	martechTosUploadCredentials: {
		bearer_token: string;
	};
	mailosaur: {
		apiKey: string;
		inviteInboxId: string;
		signupInboxId: string;
		domainsInboxId: string;
		defaultUserInboxId: string;
		totpUserInboxId: string;
	};
	testAccounts: {
		[ key in TestAccountName ]: TestAccountCredentials;
	};
	otherTestSites: {
		[ key in OtherTestSiteName ]: string;
	};
}
